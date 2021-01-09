// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const keep_alive = require('./keep_alive.js');
const addQuotes = require('./quotes.js');
const schedule = require('node-schedule');
const moment = require('moment');
const token = process.env.SLACK_BOT_TOKEN;
const channel = "CDJMS683D"; 
const Airtable = require('airtable');
Airtable.configure({
	endpointUrl: 'https://api.airtable.com',
	apiKey: process.env.AIRTABLE_API_KEY
});
const base = Airtable.base('appogmRaVRo5ElVH7');
let speedArr = [];
let latest;

addQuotes();

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
			limit: 100,
		});
		let number;
		for (let x = 0; x < result.messages.length; x++) {
			number = extractNumber(
				result.messages[x].text,
			);

			if (!isNaN(number)) break;
		}
		return number;
	} catch (error) {
		console.error(error);
	}
}

async function fetchOldest(id) {
	try {
		const result = await app.client.conversations.history({
			token: token,
			channel: id,
			oldest: Math.floor(Date.now() / 1000) - 86400, //debug: 1609295166, actual: Math.floor(Date.now() / 1000) - 86400
			inclusive: false,
		});
		let number;
		for (let x = result.messages.length - 2; x >= 0 ; x--) {
			number = extractNumber(
				result.messages[x].text,
			);

			if (!isNaN(number)) break;
		}
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

async function addData(db, object) {
	base(db).create(object, function(err, record){
		if (err) {
			console.error(err);
			return;
		}
		// console.log(record.getId());
	})
}

async function getAverage() {
	try {
		const obj = await base('increase')
			.select({
				maxRecords: 30,
				sort: [{ field: 'Date', direction: 'desc' }]
			})
			.firstPage();

		let sum = 0;
		obj.forEach((item) => (sum += item.fields.increase));

		return sum / 30;
	} catch (error) {
		console.error(error);
	}
}

async function report() {
	let oldest = await fetchOldest(channel);
	let latest = await fetchLatest(channel);
	let diff = latest - oldest;
	addData('increase', {
		"Date": moment().subtract(1, "days").format("YYYY-MM-DD"),
		"increase": diff,
		"stats": [
        "rec2XI8QAsPr7EMVB"
      ]
	})
	let averageSpeed = await getAverage();
	let thousandsGoal = Math.ceil(latest / 1000) * 1000;
	let thousandsTime = predictTime(thousandsGoal, latest, averageSpeed);
	let tenThousandsGoal = Math.ceil(latest / 5000) * 5000;
	let pastThousandsGoal = Math.floor(latest / 1000) * 1000;
	let tenThousandsTime = predictTime(tenThousandsGoal, latest, averageSpeed);
	let message =
		`Good evening, my underlings! You have done a _brilliant_ job with the counting. Mmm. Yes. Numbers are savory. 
		Today we've went from *${oldest}* to *${latest}*!
		- :arrow_upper_right: The day's progress: *+${diff}*
		- :chart_with_upwards_trend: Average daily speed: *${Math.round(averageSpeed)}*
		- :round_pushpin: At the avg speed, we'll reach ${thousandsGoal} *${thousandsTime}* 
		- :calendar: At the avg speed, we'll reach ${tenThousandsGoal} *${tenThousandsTime}* 
		:bat: Lovely work, my followers! Keep on quenching my thirst for numbers!`;
	if (pastThousandsGoal > oldest && pastThousandsGoal <= latest) {
		let messageWithCelebration = `:tada: Congratulations! We've went past ${pastThousandsGoal}! :tada:` + message;
		publishMessage(channel, messageWithCelebration); 
		// publishMessage('C017W4PHYKS', messageWithCelebration);
	} else {
		publishMessage(channel, message);
		// publishMessage('C017W4PHYKS', message);
	}

};

function predictTime(goal, recent, averageSpeed) {
	let daysLeft = (goal - recent) / averageSpeed;
	let unix = new Date(Date.now() + daysLeft * 86400000);
	return moment(unix).fromNow();
}

app.event('message', async (body) => {
	try {
		let e = body.event;
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
		let j = schedule.scheduleJob('0 0 * * *', report);
		// let j = schedule.scheduleJob('*/15 * * * * *', report);
	} catch (error) {
		console.error(error);
	}
})();
