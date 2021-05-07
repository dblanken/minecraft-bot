# minecraft-bot
Reports user logins and logouts in Minecraft through a discord channel

Sample .env:
```sh
DISCORD_BOT_TOKEN=12345678
DISCORD_CHANNEL_ID=71234567
ADMIN_ID=12343434334
LOGFILE=/opt/minecraft/server/logs/latest.log
```

DISCORD_BOT_TOKEN: The bot token to bind to
DISCORD_CHANNEL_ID: The channel to log to
ADMIN_ID: The discord ID number of yourself so you can send commands to the channel
LOGFILE: The minecraft logfile to keep track of
