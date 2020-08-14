# Million Stats

This is an app for the #counttoamillion channel in Hack Club's Slack workspace. You can also clone this for anything that involves counting to a very high number :)
Every midnight, it gives a report on the progress the channel's made and the average daily speed:
![shows the day's increase, the average daily speed, and the predicted amount of time needed to reach the next thousand/tenthousand](https://cdn.glitch.com/95c2faf1-779e-4e08-b219-8a122cdceefe%2Fbotdemo.png?v=1594948839444)
It also adds an emoji reaction at every number ending with 69, every 1000, and every 5000.

## Modifying this thing

- `app.js` contains the primary Bolt app. It imports the Bolt package (`@slack/bolt`) and starts the Bolt app's server.
- `.env` is where you'll put your Slack app's authorization token and signing secret.

### Packages used:
- [moment.js](https://momentjs.com/)
- [node-schedule](https://www.npmjs.com/package/node-schedule)
- [Slack's Bolt API](https://slack.dev/bolt-js/tutorial/getting-started)

\ ゜ o ゜)ノ
