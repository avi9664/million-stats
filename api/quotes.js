let regularStartQuotes = [
	"The DRACC is BACC with another midnight report!",
	"The clock striketh twelve, and the world’s only number-sucking vampire cometh with another report on your midnight progress!",
	"…Ugggh, my back hurts from sleeping in this old coffin! `*loud cracking noise*` Damn thing’s going to bend my spine into a knot if I don’t replace it soon. Anyways, here is your progress so far:",
	"Good evening, my underlings, it’s your friendly neighborhood genderbending vampire with another midnight report!",
	"Grumble mumble mumble, had a terrible sleep today. I need some more nUMBERS, my children!",
	"Back just in time for the midnight report! I apologize for the haphazard appearance, my dog Count von Corgo insisted on an early-evening walk in the park— wait, you can’t see me on Slack, can you? I COULD BE WEARING MY BIRTHDAY SUIT AND NO ONE WILL NOTICE IT! OHOHOHOHO!",
	"WHO DARETH WAKE ME FROM MY SLUMBER— oh. it’s the statistical report. Riiiight.",
	"I feel like _crap_ today. Woke up five times in the middle of the night because I thought I heard a mosquito buzzing by my ear. Shouldn’t have sucked human blood yesterday. \n OH SHIT I SHOULDN’T BE TELLING YOU GUYS THAT—"
]

let regularEndQuotes = [
	"Ah, a refreshing cocktail of numbers, topped with a squeeze of lime juice, makes me feel a lot better, ready to seize the night! Or suck the life out of it! ~hahaha pun totally not intended~",
	"Yum, these numbers are delicious! `*excited vampire slurping sounds*`",
	"Yes, my lackeys, yes! Now can you multiply that increase by ten? I know y’all can do this! I know it! I crave it!",
	"I’m savoring this consistent flow of numbers, my servants! Keep me sated… or else I might turn to blood…. *_heheheheh_*",
	"My minions, I am feeling famished! You must give me _MORE_!",
	"MORE NUMBERS, MY LACKEYS! MORE!! MWAHAHAHAHA!",
	"My oh my, there are too many numbers to consume! I'll have to store some in my freezer to save for another day.",
	"Someone by the name of Orpheus has told me that these numbers go well with a mint chocolate chip sundae! I'll have to try that one day. Unfortunately, the nearest supermarket is two hours away and I'm too lazy to fly there..."
]

function addQuotes(message, rawGoals, rawSpeed) {
	let start = regularStartQuotes[Math.floor(Math.random() * regularStartQuotes.length)]
	let end;
	let goals = Math.ceil(rawGoals[1]);
	let days = rawGoals[0];
	let speed = Math.round(rawSpeed);
	let diff = goals - speed;
	if (goals <= 0) {
		end = `:tada: YOU DID IT, MY LOYAL SERVANTS! YOU'VE REACHED OUR GOAL ON TIME! :tada: But there's still loads of time before we reach a million-- let's keep up the pace!`
	} else if (diff < 10) {
		end = `You're doing well, my lackeys! Keep up that speed of at least *+${speed}* if you want to reach that goal! You have *${days}* days remaining to get there!`
	} else if (diff > 10 && diff < 1000) {
		end = `Still room to improve your performance, my underlings-- you're only at *${speed}* a day! Get that speed up to at least *+${goals}* to get there on time! You have *${days}* days left!`
	} else if (diff > 1000) {
		end = `You're slogging behind, my minions! Only *${speed}* a day? RiDONKulous! Get that speed up to at least *+${goals}* to get there on time! Hurry up!!! You have *${days}* days left to get there!`
	}
	// let end = regularEndQuotes[Math.floor(Math.random() * regularEndQuotes.length)]
	return start + "\n" + message + "\n" + end;
}

module.exports = addQuotes;