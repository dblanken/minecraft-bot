require('dotenv').config();

const {Client} = require('discord.js');
const Query = require('minecraft-query');
const client = new Client();
const moment = require('moment');

const REFRESH_INTERVAL = process.env.DISCORD_REFRESH_INTERVAL
const IP = process.env.MC_IP
const PORT = process.env.MC_PORT
const TIMEOUT = process.env.MC_QUERY_TIMEOUT

const MCSTATUS_OPTIONS = {
    host: IP,
    port: PORT,
    timeout: TIMEOUT
}

const DISCORD_ADMIN_ID = process.env.ADMIN_ID

var lastResult = []
var channel = false
var logChannel = false
var debug = false
var discordChannelId = process.env.DISCORD_CHANNEL_ID
var discordLogChannelId = process.env.DISCORD_CHANNEL_ID

// Changes posessive based on number in array
// >1 = have
// 1 = has
const has_or_have = (array) => {
    if (array.length > 1)
        return 'have'
    else
        return 'has'
}

// Given an array, it will format it in such a way:
// ['Tom', 'Dick', 'Harry'] => Tom, Dick, and Harry
// or
// ['Tom'] => Tom
// [] => No one
const join_with_and = (array) => {
    const sliced = array.slice(0, -1);
    const last_element = array.slice(-1)[0];

    if (array.length > 1)
        return `${sliced.join(', ')}, and ${last_element}`
    else if (array.length == 1)
        return array[0]
    else
        return 'No one'

}

// Sends a log message
// Based on the debug flag, this will either display in discord,
// or display in console
const sendLog = (msg) => {
    const formatStr = "MMMM Do YYYY, h:mm:ss a"
    if (!logChannel)
        logChannel = client.channels.cache.get(discordLogChannelId)

    if (debug)
        console.log(`${moment().format(formatStr)}: ${msg}`)
    else
        logChannel.send(`${moment().format(formatStr)}: ${msg}`)

}

const sendMessage = (msg) => {
    if (!channel)
        channel = client.channels.cache.get(discordChannelId)

    if (debug)
        console.log(`${msg}`)
    else
        channel.send(`${msg}`)
}

// Given a string, tokenize it and if it starts with channel
// change the channel that the bot should output to.
const changeChannel = (message, author_id) => {
    var tokens = message.split(" ")
    if (tokens[0] === "channel") {
        if (author_id == DISCORD_ADMIN_ID) {
            if (tokens[1] === "reset") {
                discordChannelId = discordLogChannelId
            }
            else {
                discordChannelId = tokens[1]
            }
            channel = client.channels.cache.get(discordChannelId)
            sendLog(`Channel set to ${discordChannelId}`)
        }
        else if (debug) {
            sendLog('You are not dblanken')
        }
    }
}

// Use minecraft-query to get the list of users
// If there are users, check the last time to see if anyone new
// logged on or off and message discord accordingly.
const minecraftCheck = (options) => {
    var q = new Query(options);
    var online_players = 0;
    var players = [];

    if (debug) {
        sendLog("Checking...")
    }

    q.fullStat()
        .then(success => {
            online_players = parseInt(success.online_players);
            players = success.players;
            q.close();
        }).then(success => {
            if (online_players > 0) {
                var newPlayers = players.filter(x => !lastResult.includes(x))

                if (newPlayers.length > 0)
                    sendMessage(`${join_with_and(newPlayers)} ${has_or_have(newPlayers)} joined the server`)
            }

            var leftPlayers = lastResult.filter(x => !players.includes(x))

            if (leftPlayers.length > 0)
                sendMessage(`${join_with_and(leftPlayers)} ${has_or_have(leftPlayers)} have left the server`)

            lastResult = players
        })
        .catch(console.error)
};

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);

    minecraftCheck(MCSTATUS_OPTIONS)

    // Check status
    var intervalId = client.setInterval(() => minecraftCheck(MCSTATUS_OPTIONS), REFRESH_INTERVAL)
});

client.on('message', msg => {
    changeChannel(msg.content, msg.author.id)
})

client.login(process.env.DISCORD_BOT_TOKEN);
