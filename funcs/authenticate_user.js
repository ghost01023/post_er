const mysql = require("mysql")
const fs = require("fs");
const CookieHashCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-_.~";

const  { sessionPath } = require("./paths");

const database = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'people_data'
})

const AuthenticateUser = (req, res) => {
    console.log("login has been called!")
    const username_email = req.body["email_username"];
    const password = req.body["password"];
    console.log(username_email);
    console.log(password);
    if (!username_email) {
        res.send({status: "un_found"})
        return
    }
    const check_user_query = `SELECT * FROM profile WHERE (username = '${username_email}' 
or email = '${username_email}') and password = '${password}'`
    new Promise((resolve) => {
        database.query(check_user_query, (err, query_res) => {
            console.log(query_res)
            if (err) {
                console.log("Couldn't fetch comparison details")
            } else {
                if (query_res.length === 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        })
    }).then(user_exists => {
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
                    json_cookie_data[username_email] = randomHash;
                    console.log("cookie data already is " + JSON.stringify(json_cookie_data))
                    fs.writeFile((sessionPath + "/cookie_users.json"), JSON.stringify(json_cookie_data), (err) => {
                        if (err) console.log("Error writing to session cookie data file!")
                        else {
                            console.log("you are now in a state of login!")
                            res.cookie("seltzer", randomHash);
                            res.cookie("user", username_email);
                            console.log("sending to feed posts page...")
                            res.redirect("/feed-posts")
                        }
                    })
                }
            })
        }
    })
}

module.exports = { AuthenticateUser }