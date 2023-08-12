const {PrivilegedUser} = require("./check_privilege");
const fs = require("fs");
const {usersPath} = require("./paths");

const FollowUser = (req, res) => {
    const username = req.cookies.user;
    console.log(username + " has submitted following form: ")
    console.log(req.body.user)
    const toFollow = req.body.user;
    console.log("user wants to follow " + toFollow)
// return
    PrivilegedUser(req).then(privy => {
        if (privy) {
            fs.readFile((usersPath + username + "/preferences/following.json"), (err, data) => {
                let dataJson = JSON.parse(data.toString())
                if (!dataJson.includes(toFollow)) {
                    console.log("Adding to following.json list")
                    dataJson.push(toFollow)
                    fs.writeFile((usersPath + username + "/preferences/following.json"), (JSON.stringify(dataJson)), err => {
                        if (err) {
                            console.log('Error occurred while updating following profile.')
                        } else {
                            fs.readFile((usersPath + toFollow + "/preferences/followers.json"), (err, data) => {
                                let dataJson = JSON.parse(data.toString());
                                dataJson.push(username);
                                fs.writeFile((usersPath + toFollow + "/preferences/followers.json"), JSON.stringify(dataJson), err => {
                                    if (err) {
                                        console.log("Error occurred while writing to toFollowed-s file.")
                                    }
                                    fs.readFile((usersPath + username + "/preferences/profile_details.json"), (err, data) => {
                                        let dataJson = JSON.parse(data.toString())
                                        dataJson["following"] += 1;
                                        fs.writeFile((usersPath + username + "/preferences/profile_details.json"), JSON.stringify(dataJson), err => {
                                            if (err) {
                                                console.log("Error occurred while updating profile details.json file of username")
                                            }
                                            fs.readFile((usersPath + toFollow + "/preferences/profile_details.json"), (err, data) => {
                                                let dataJson = JSON.parse(data.toString())
                                                dataJson.followers += 1;
                                                fs.writeFile((usersPath + toFollow + "/preferences/profile_details.json"), JSON.stringify(dataJson), (err) => {
                                                    if (err) {
                                                        console.log("Error occurred while writing to toFollow user's profile_details.json")
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        }
                    })
                }
            })
        }
    })
}


const UnFollowUser = (req, res) => {
    const username = req.cookies.user;
    const toUnFollow = req.body.user;
    console.log("toUnFollow is " + toUnFollow)
    PrivilegedUser(req).then(privy => {
        if (privy) {
            fs.readFile((usersPath + username + "/preferences/following.json"), (err, data) => {
                let dataJson = JSON.parse(data.toString())
                if (dataJson.includes(toUnFollow)) {
                    dataJson.splice(dataJson.indexOf(toUnFollow), 1)
                    fs.writeFile((usersPath + username + "/preferences/following.json"), (JSON.stringify(dataJson)), err => {
                        if (err) {
                            console.log('Error occurred while updating following profile.')
                        } else {
                            fs.readFile((usersPath + toUnFollow + "/preferences/followers.json"), (err, data) => {
                                let dataJson = JSON.parse(data.toString());
                                dataJson.splice(dataJson.indexOf(username), 1);
                                fs.writeFile((usersPath + toUnFollow + "/preferences/followers.json"), JSON.stringify(dataJson), err => {
                                    if (err) {
                                        console.log("Error occurred while writing to toFollowed-s file.")
                                    }
                                    fs.readFile((usersPath + username + "/preferences/profile_details.json"), (err, data) => {
                                        let dataJson = JSON.parse(data.toString())
                                        dataJson["following"] -= 1;
                                        fs.writeFile((usersPath + username + "/preferences/profile_details.json"), JSON.stringify(dataJson), err => {
                                            if (err) {
                                                console.log("Error occurred while updating profile details.json file of username")
                                            }
                                            fs.readFile((usersPath + toUnFollow + "/preferences/profile_details.json"), (err, data) => {
                                                let dataJson = JSON.parse(data.toString())
                                                dataJson.followers -= 1;
                                                fs.writeFile((usersPath + toUnFollow + "/preferences/profile_details.json"), JSON.stringify(dataJson), (err) => {
                                                    if (err) {
                                                        console.log("Error occurred while writing to toFollow user's profile_details.json")
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        }
                    })
                }
            })
        }
    })
}


module.exports = { UnFollowUser, FollowUser }