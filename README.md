# Table Top Tennis Slack Bot :ping_pong:

This small slack bot was created in the context of a job interview.
It provides two endpoints, which can be configured as a slash-command in a slack channel.

1. `/requestLogging` is used to log a table top tennis match. It allows the caller to pick a date, select the two players and the outcome.
2. `/requestRanking` is used to post the current ranking to the channel.

A cron job posts the ranking once a day at 6pm.

To configure the bot, use the provided `.env.dist` file to create a `.env` file and populate the necessary environment variables.
