//CREATE FUNCTION TO CREATE USER FEED [also privileged action]
// FOR SENDING TO THE CONSTRUCT PAGE
//CONSTRUCT RANDOM GEN HASH COOKIE SEND IT TO USER
//THIS COOKIE WILL BE USED TO VERIFY THE USER'S PRIVILEGES
//WHENEVER HE LIKES, COMMENTS, POSTS, FOLLOWS ETC.
//STORE DATA OF COOKIE HASHES INSIDE THE SESSION/COOKIE_USERS.JSON
//EACH TIME PRIVILEGE ACTION REQUEST IS MADE, IT IS MADE WITH USER
//NAME INTACT AND COOKIE IS ALSO SENT TO SERVER THAT CROSS-CHECKS
//COOKIE AGAINST USERNAME IN SESSION/COOKIE_USERS.JSON AND IF FOUND TRUE,
//LETS USER PERFORM ACTION AND MODIFIES HIS PROFILE FOLDER ACCORDINGLY


//FUNCTION THAT RETURNS TRUE IF USER HAS REGISTERED PRIVILEGES
// [THROUGH COOKIE HASH STATE CHECK ONLY]
// SO THAT HE CAN PERFORM ACTIONS SPECIFIC TO HIS PROFILE.
// THESE ACTIONS INCLUDE:
//1. LOADING FEED,
//2. FOLLOWING AND UNFOLLOWING PEOPLE TO INDIRECTLY MODIFY HIS
//   FOLLOWING JSON FILE
//3. POSTING AND DELETING POSTS TO INDIRECTLY MODIFY HIS
//   POSTS JSON FILE
//4. COMMENTING ON POSTS
//5. LIKING POSTS
//6. EDITING HIS OWN PROFILE SUCH AS DISPLAY NAME (nickname?) ??
//7. BEING ABLE TO SET PROFILE PICTURE

const fs = require("fs")
const {sessionPath} = require("./paths")

const PrivilegedUser = async (req) => {
    if (!req.cookies["user"] || !req.cookies["seltzer"]) {
        return false
    }
    const {user, seltzer} = req.cookies
    return new Promise((resolve) => {
        fs.readFile((sessionPath + "/cookie_users.json"), (err, data) => {
            if (err) {
                resolve(false)
            } else {
                let data_json = JSON.parse(data.toString());
                if (data_json[user]) {
                    if (data_json[user] === seltzer) {
                        console.log("User has Privilege...")
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                } else {
                    resolve(false)
                }
            }
        })
    })
}

module.exports = { PrivilegedUser }