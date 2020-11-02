require('dotenv').config();

const {Client} = require('discord.js');
const client = new Client();
const moment = require('moment');
const Tail = require('tail').Tail;

const REFRESH_INTERVAL = process.env.DISCORD_REFRESH_INTERVAL
const LOGFILE = process.env.LOGFILE

const DISCORD_ADMIN_ID = process.env.ADMIN_ID

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

const DATEFORMAT = "MMMM Do YYYY, h:mm:ss a"

// Sends a log message
// Based on the debug flag, this will either display in discord,
// or display in console
const sendLog = (msg) => {
    const formatStr = DATEFORMAT
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

var tail = new Tail(LOGFILE)
var JOIN_LEFT_GAME_REGEX = /([^ ]+ left the game|[^ ]+ joined the game)/g

tail.on("line", (data) => {
    var login_logout = data.match(JOIN_LEFT_GAME_REGEX)

    if (login_logout)
        sendMessage(login_logout)
})

tail.on("error", (error) => {
    sendLog(`ERROR: ${error}`)
})

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);

});

client.on('message', msg => {
    changeChannel(msg.content, msg.author.id)
})

client.login(process.env.DISCORD_BOT_TOKEN);
