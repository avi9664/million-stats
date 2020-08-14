// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const keep_alive = require('./keep_alive.js')
const schedule = require('node-schedule');
const moment = require('moment');
const token = process.env.SLACK_BOT_TOKEN;
const channel = "CDJMS683D"; //'C017W4PHYKS' for debugging, "CDJMS683D" actual
const Airtable = require('airtable');
Airtable.configure({
	endpointUrl: 'https://api.airtable.com',
	apiKey: process.env.AIRTABLE_API_KEY
});
const base = Airtable.base('appogmRaVRo5ElVH7');
let speedArr = [];
let latest;
let averageSpeed;

const app = new App({
	token: token,
	signingSecret: process.env.SLACK_SIGNING_SECRET
});

function extractNumber(txt) {
	let array = ["\n", " ", "-"]
	for (let i of array) {
		if (txt.includes(i)) {
			return txt.split(i)[0]
		}
	}
	return txt;
}

async function fetchLatest(id) {
	try {
		const result = await app.client.conversations.history({
			token: token,
			channel: id,
			limit: 1,
		});
		const number = extractNumber(result.messages[0].text)
		return number;
	} catch (error) {
		console.error(error);
	}
}

async function fetchOldest(id) {
	try {
		let last24Hrs;
		const result = await app.client.conversations.history({
			token: token,
			channel: id,
			oldest: Math.floor(Date.now() / 1000) - 86400, //debug: 1596326400, actual: Math.floor(Date.now() / 1000) - 86400
			inclusive: false
		});
		const number = extractNumber(result.messages[result.messages.length - 2].text);
		return number - 1;
	} catch (error) {
		console.error(error);
	}
}

async function publishMessage(id, text) {
	try {
		const result = await app.client.chat.postMessage({
			token: token,
			channel: id,
			text: text
		});
	} catch (error) {
		console.error(error);
	}
}

async function postReaction(id, emoji, ts) {
	try {
		const result = await app.client.reactions.add({
			token: token,
			channel: id,
			name: emoji,
			timestamp: ts
		});
	} catch (error) {
		console.error(error)
	}
}

async function pinMessage(id, ts) {
	try {
		const result = await app.client.pins.add({
			token: token,
			channel: id,
			timestamp: ts
		})
	} catch (error) {
		console.error(error)
	}
}

function findMean(arr) {
	let totalSum = 0;
	for (let i of arr) {
		totalSum += i;
	}
	return totalSum / arr.length;
}

function predictTime(goal) {
	let daysLeft = (goal - latest) / averageSpeed
	let unix = new Date(Date.now() + daysLeft * 86400000)
	return moment(unix).fromNow();
}

async function report() {
	let oldest = await fetchOldest(channel);
	latest = await fetchLatest(channel);
	let diff = latest - oldest;
	speedArr.push(diff);
	// base('increase').create({
	// 	"Date": 
	// })
	averageSpeed = findMean(speedArr).toFixed(3);
	let thousandsGoal = Math.ceil(latest / 1000) * 1000;
	let thousandsTime = predictTime(thousandsGoal)
	let tenThousandsGoal = Math.ceil(latest / 5000) * 5000;
	let pastThousandsGoal = Math.floor(latest / 1000) * 1000;
	let tenThousandsTime = predictTime(tenThousandsGoal)
	let message =
		"Nice! Today we've went from *" +
		oldest +
		"* to *" +
		latest +
		"*! \n - :arrow_upper_right: The day's progress: *+" +
		diff +
		"*\n - :chart_with_upwards_trend: Average daily speed: *" +
		averageSpeed +
		"*\n - :round_pushpin: At the avg speed, we'll reach " +
		thousandsGoal +
		" *" +
		thousandsTime +
		"*\n - :calendar: At the avg speed, we'll reach " +
		tenThousandsGoal +
		" *" +
		tenThousandsTime +
		"* \n :fastparrot: KEEP IT GOING GUYS!";
		if (pastThousandsGoal > oldest && pastThousandsGoal <= newest) {
			let messageWithCelebration = ":tada: YAY! We've went past " + pastThousandsGoal + "! :tada: \n" + message;
			publishMessage(channel, messageWithCelebration);
		} else {
			publishMessage(channel,message);
		}
	
}

app.event('message', async (body) => {
	try {
		let e = body.event;
		console.log('okay it works');
		if (typeof e.subtype === "undefined" && /\d/.test(e.text[0])) {
			let number = extractNumber(e.text);
			let ts = e.ts;
			let c = e.channel;
			if (number % 1000 === 0) {
				postReaction(c, "tada", ts);
			}
			if (number % 5000 === 0) {
				pinMessage(c, ts);
			}
			let l = number.length;
			if (number[l - 2] == 6 && number[l - 1] == 9) {
				postReaction(c, "ok_hand", ts);
			}
		}
	} catch (err) {
		console.error(err);
	}
});

(async (req, res) => {
	// Start your app
	try {
		await app.start(process.env.PORT || 3000);
		let j = schedule.scheduleJob('0 0 * * *', report); // */1 * * * * for debugging, 0 0 * * * actual
		publishMessage('C017W4PHYKS', 'running every midnight!')
	} catch (error) {
		console.error(error);
	}
})();
