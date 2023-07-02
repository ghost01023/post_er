const mysql = require("mysql")
const fs = require("fs");
const CookieHashCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-_.~";

const  { sessionPath } = require("./paths");
const { CheckUser } = require("./manage_user")

const database = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'people_data'
})


//AUTHENTICATES THROUGH THIS PROCESS:
//  |
//  |---Checks if the user post request callback contains a non_empty username/email and password
//          |(then)
//          |----Checks if username/email and password match any entries present in the users database
//                  |(then)
//                  |-----If user does not exist, it sends a not found response_message.json
//                          |(else)
//                              |------Generates a random non_present cookie_hash and sends to user in res
//                                      |(then)
//                                      |--------Redirects to '/' path which will act on basis of cookie hash
//                                              and load the feed/response page accordingly

//It is important to understand that the authenticate request is only being called through the fetch method
//on the login page and after cookies have been sent, then  - and only then - does the client browser
// post through the "/login" path and get any proper response file(s) from the server


const AuthenticateUser = (req, res) => {
    const email_username = req.body["email_username"];
    const password = req.body["password"];
    if (!email_username || !password) {
        res.send({status: "Empty Fields"})
        return
    }
    CheckUser(email_username, password)
        .then(user_exists => {
        if (!user_exists) {
            res.send("Your name was NOT found in the database. " + "Try again or <a href='#'>Create a new account</a>")
        } else {
            let randomHash = "";
            for (let i = 0; i < 50; i++) {
                randomHash += CookieHashCharacters[Math.floor(Math.random() * CookieHashCharacters.length)]
            }
            fs.readFile((sessionPath + "/cookie_users.json"), (err, string_cookie) => {
                if (err) console.log("Session cookie data unavailable!"); else {
                    let json_cookie_data = JSON.parse(string_cookie.toString());
                    json_cookie_data[email_username] = randomHash;
                    console.log("cookie data already is " + JSON.stringify(json_cookie_data))
                    fs.writeFile((sessionPath + "/cookie_users.json"), JSON.stringify(json_cookie_data), (err) => {
                        if (err) console.log("Error writing to session cookie data file!")
                        else {
                            console.log("Log-in Successful...")
                            res.cookie("seltzer", randomHash);
                            res.cookie("user", email_username);
                            console.log("Redirecting to /feed-posts")
                            res.redirect("/feed-posts")
                        }
                    })
                }
            })
        }
    })
}

module.exports = { AuthenticateUser }