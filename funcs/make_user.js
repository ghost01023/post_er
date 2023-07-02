// import fs from "fs";
// import path from "path";
const fs = require("fs");
const path = require("path");
const usersPath = "C:/Users/Rosja Dostoyevsjky/Documents/Webstorm/Visual Studio Code/POST-er/database/users/";
const mysql = require("mysql");

const database = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'people_data'
})
//A VARIED FUNCTION THAT ADDS A NEW USER AND IS CALLED FROM THE SIGNUP
//FORM POST METHOD

const AddUser = (username, email, password) => {
    const add_profile_instructions = (`INSERT INTO profile (email, username, password) VALUES ("${email}", "${username}", "${password}")`);
    database.query(add_profile_instructions, (err) => {
        console.log("querying database for user name")
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log("That Username is Already Taken!");
            } else {
                console.log("Somebody Done Fucked Up!")
                console.log(err);
            }
        } else {
            if (!createUserFolder(username)) {
                console.log("Folder Couldn't Be Created!")
            } else {
                console.log(username + "'s User Folder was created successfully!");
            }
        }
    })
}

//CREATES USER FOLDER FOR STORAGE OF THEIR IMAGES AND CAPTIONS
//ALSO ALLOCATES A SMALL FILE posts.json THAT STORES
//VALUE PAIRS OF POST LOCATIONS, TIME UPLOADED, CAPTIONS
//POSSIBLY INTRODUCE EVEN COMMENTS?
//ALSO CREATES A FEED FILE FOR THIS USER AND SERVES AND
//UPDATES THE FEED POST LINKS IN THIS

async function createUserFolder(name) {
    let directoryViable = true
    let postDirViable = true
    let postImageDirViable = true
    let feedDirViable = true
    let feedJsonViable = true
    fs.mkdirSync(path.join(usersPath + name), (err) => {
        if (err) {
            console.log(err);
            directoryViable = false
        }
    });
    if (!directoryViable) {
        return false
    }
    fs.mkdirSync(path.join(usersPath + name + "/posts"), (err) => {
        if (err) {
            console.log(err)
            postDirViable = false
        }
    })
    if (!postDirViable) {
        fs.rmdirSync(path.join(usersPath + name))
        return false
    }
    fs.appendFileSync((usersPath + name + "/posts/posts.json"), '[]', err => {
        if (err) {
            fs.rmdirSync(path.join(usersPath + name));
        }
    })
    fs.mkdirSync(path.join(usersPath + name + "/posts/images"), (err) => {
        console.log("made images folder")
        if (err) {
            fs.rmdirSync(path.join(usersPath + name));
            postDirViable = false
            console.log("Cannot create Post Images Folder")
        }
    })
    if (!postImageDirViable) {
        fs.rmdirSync(path.join(usersPath + name));
        return false
    }
    fs.mkdirSync(path.join(usersPath + name + "/feed"), (err) => {
        if (err) {
            console.log(err)
            feedDirViable = false
        }
    })
    if (!feedDirViable) {
        fs.rmdirSync(path.join(usersPath + name))
        return false
    }
    fs.appendFileSync((usersPath + name + "/feed/feed.json"), '[]', (err) => {
        if (err) {
            feedJsonViable = false
        }
    })
    if (!feedJsonViable) {
        fs.rmdirSync(path.join(usersPath + name))
        return false
    }
    fs.readFile((usersPath + name + "/posts/posts.json"), (err, json) => {
        if (err) {
            console.log("Could Not Read user/posts/posts.json File")
        }
        let post_file_json = JSON.parse(json.toString())
        post_file_json.push({"second extended": "my_man_here now!!"});
        fs.writeFile((usersPath + name + "/posts/posts.json"), JSON.stringify(post_file_json), (err) => {
            if (err) {
                console.log("Could Not Append to user/posts/posts.json File!");
            }
        })
    })
    createUserPreference(name).then(res => {
        console.log(name + "'s User Preferences Folder was Successfully Created!")
    })
    return true
}

async function createUserPreference(name) {
    let prefDirViable = true
    let profDetailsViable = true
    let profFollowersViable = true
    let profFollowingViable = true
    fs.mkdirSync(path.join(usersPath + name + "/preferences"), (err) => {
        if (err) {
            prefDirViable = false
            console.log(err);
            return false
        }
    })
    if (!prefDirViable) {
        fs.rmdirSync(path.join(usersPath + name))
        return
    }
    fs.appendFileSync((usersPath + name + "/preferences/profile_details.json"), "[]", err => {
        if (err) {
            profDetailsViable = false
            console.log(err)
        }
    })
    if (!profDetailsViable) {
        fs.rmdirSync(path.join(usersPath + name))
        return
    }
    fs.appendFileSync((usersPath + name + "/preferences/followers.json"), "[]", err => {
        if (err) {
            profFollowersViable = false
            console.log(err)
        }
    })
    if (!profFollowersViable) {
        fs.rmdirSync(path.join(usersPath + name))
        return
    }
    fs.appendFileSync((usersPath + name + "/preferences/following.json"), "[]", err => {
        if (err) {
            profFollowingViable = false
            console.log(err)
        }
    })
    if (!profFollowingViable) {
        fs.rmdirSync(path.join(usersPath + name))
    }
}


//CHECKS IF A USERNAME OR EMAIL EXISTS AND THEN IF
//THE PASSWORD MATCHES. RETURNS TRUE, OTHERWISE FALSE

async function CheckUser(email_username, password) {
    const checkQuery = `SELECT * FROM profile WHERE (profile.username = "${email_username}" 
OR profile.email = "${email_username}") AND profile.password = "${password}"`
    return new Promise((resolve, reject) => database.query(checkQuery, (err, res) => {
        if (err) {
            reject(new Error())
        } else {
            console.log(res)
            console.log("good going till now")
            resolve(res)
        }
    })).catch(() => {
        console.log("Error Occurred!")
    })
}

module.exports = { AddUser }