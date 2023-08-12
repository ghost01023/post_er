const { usersPath } = require("./paths.js")
const fs = require("fs")

const FetchChat = (user, other) => {
    return new Promise((resolve, reject) => {
        fs.readFile((usersPath + user + "/chat/chat_" + other + ".json"), (err, data) => {
            if (err) {
                console.log("Couldn't read json of " + user + "'s chat_list with " + other)
                resolve("Nothing here. User doesn't exist")
            } else {
                resolve(JSON.parse(data.toString()))
            }
        })
    })
}


module.exports = { FetchChat }