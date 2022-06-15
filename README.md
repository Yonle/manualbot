# Manual Bot
Create your own bot command directly in telegram

## Setting up
Install all required package by running `npm install`, and fill `.env` file:

```
TOKEN=BOT-TOKEN-HERE
OWNER_ID=OWNER-USER-ID-HERE
```

And start the bot up with `node index.js`.

Message to your bot, And execute `/create` to start creating a command.

## Known issue
This is grammy internal issue, Where multiple session login error throws up even not doing `bot.start` twice (We only call `bot.command` after new command is created).

It seems that `bot.command` starting a new session even the current session is started already. I, Myself had no idea either.

