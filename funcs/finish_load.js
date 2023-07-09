const fs = require("fs")
const {usersPath} = require("./paths.js")

const {PrivilegedUser} = require("./check_privilege.js")
const {SortPostByLatest} = require("./try_sort")
const MaxPosts = 3


const GetFeedPosts = (req, res) => {
    const email_username = req.cookies.user;
    const cookie_hash = req.cookies["seltzer"];
    console.log("Username is " + email_username + " and the Cookie Hash is " + cookie_hash);
    PrivilegedUser(req).then(privy => {
        if (!privy) {
            res.redirect("/")
        } else {
            return ReadFollowers(email_username)
        }
    }).then(following => {
        InitUserPostDict(email_username, following).then(feedObject => {
            FirstFeedPosts(email_username, feedObject, following).then((bA) => {
                res.send(bA.flat(1))
            })
        })
    })
}


const FirstFeedPosts = (email_username, feedObject, following) => {
    let {userPostDictionary, stablePostArray} = feedObject
    console.log("StablePostArray AT Initial Fetch is ")
    console.log(stablePostArray)
    const traversal = Object.keys(userPostDictionary).length
    let traversed = 0
    let selfDict = {}
    return new Promise((resolve, reject) => {
        following.map(user => {
            const endIn = userPostDictionary[user]["endIn"]
            const fetched = userPostDictionary[user]["fetched"]
            // console.log("First fetched for " + user + " is " + fetched + " and will range to " + endIn)
            selfDict[user] = {
                fetched: 0, endOfPosts: ""
            }
            FetchUserPosts(email_username, user, fetched, endIn).then((resolvedData) => {
                // console.log("Resolution for " + user + " is")
                // console.log(resolvedData)
                stablePostArray[user] = resolvedData[0]
                // console.log("Fetched " + resolvedData[1] + ' posts for ' + user)
                selfDict[user]["fetched"] = resolvedData[1]
                selfDict[user]["endOfPosts"] = resolvedData[2]
                // console.log("EndofPosts for " + user + " is " + resolvedData[2])
                // selfDict[user]["endIn"] =
                traversed++
                //IF ALL FOLLOWED USERS' POST HAVE BEEN FETCHED...
                if (traversed === traversal) {
                    // console.log("traversed is EQUAL TO traversal")
                    // console.log(stablePostArray)
                    EqualizeFeedJson(email_username, stablePostArray, selfDict).then((posts) => {
                        resolve(posts)
                    })
                }
            })
        })
    })
}


const EqualizeFeedJson = (email_username, stablePostArray, userSelfDict) => {
    console.log()
    return new Promise((resolve, reject) => {
        fs.readFile((usersPath + email_username + "/feed/feed.json"), (err, data) => {
            let dataJson = JSON.parse(data.toString())
            // console.log("Here's what we will write changes to: ")
            // console.log(dataJson)
            for (let user in dataJson["userPostDictionary"]) {
                if (!userSelfDict[user]) {
                    delete dataJson["userPostDictionary"][user]
                } else {
                    dataJson["userPostDictionary"][user] = {...dataJson["userPostDictionary"][user], ...userSelfDict[user]}
                }
            }
            dataJson["firstAccess"] = false
            // console.log("to be written will be: ")
            let oneBigArray = []
            Object.keys(stablePostArray).map(user => {
                oneBigArray = oneBigArray.concat(stablePostArray[user])
            })
            oneBigArray = SortPostByLatest(oneBigArray.flat(1))
            let userPosts = []
            //Map over all username keys and take all posts, put them in
            //one big array. The sort it, get latest [5] posts, put all others in stable post array
            //also write to file which users' posts were sent
            if (oneBigArray.length > MaxPosts) {
                userPosts = oneBigArray.slice(0, MaxPosts);
                oneBigArray = oneBigArray.slice(MaxPosts, oneBigArray.length)
            } else if (oneBigArray.length <= MaxPosts) {
                userPosts = oneBigArray
                oneBigArray = []
                dataJson["endOfFeed"] = true
            }
            let stablePostObj = {}
            oneBigArray.map(post => {
                if (stablePostObj[post.username]) {
                    stablePostObj[post.username].push(post)
                } else {
                    stablePostObj[post.username] = [post]
                }
            })
            userPosts.map(post => {
                if (!stablePostObj[post.username]) {
                    stablePostObj[post.username] = []
                }
            })
            // console.log("stablePostObj is ")
            // console.log(stablePostObj)
            dataJson["stablePostArray"] = stablePostObj
            for (let user in dataJson["userPostDictionary"]) {
                if (!stablePostObj[user] && dataJson["userPostDictionary"][user]["endOfPosts"]) {
                    delete dataJson["userPostDictionary"][user]
                } else {
                    if (!dataJson["accessedUsers"].includes(user)) {
                        dataJson["accessedUsers"].push(user)
                    }
                }
            }
            fs.writeFile((usersPath + email_username + "/feed/feed.json"), JSON.stringify(dataJson), (err) => {
                if (err) {
                    console.log("Final write error.")
                } else {
                    resolve(userPosts)
                    console.log("After Resolution of feed.json, dataJson is")
                    console.log(dataJson)
                }
            })
        })
    })
}


const MoreFeedPosts = (req, res) => {
    const email_username = req.cookies.user;
    let bigArray = []
    let userPosts = []
    PrivilegedUser(req).then((privy) => {
        if (privy) return new Promise((resolve, reject) => {
            fs.readFile(usersPath + email_username + "/feed/feed.json", (err, data) => {
                resolve(JSON.parse(data.toString()))
            })
        })
        else {
            res.send({access: "denied"})
        }
    }).then(feedObject => {
        console.log("In loadMoreFeedPosts Function, the feedObject is...")
        console.log(feedObject)
        let {accessedUsers, userPostDictionary, stablePostArray, endOfFeed} = feedObject;
        let traversal = 0;
        for (let user in userPostDictionary) {
            if (!userPostDictionary[user]["endOfPosts"] && stablePostArray[user].length !== MaxPosts) {
                traversal++
            }
        }
        console.log("traversal is to be " + traversal)
        //SAVE CHANGES TO
        return new Promise((resolve, reject) => {
            let traversed = 0;
            if (traversal === 0 && endOfFeed) {
                console.log("End of feed now. Calculating response based on final posts...")
                for (let user in stablePostArray) {
                    bigArray = bigArray.concat(stablePostArray[user])
                    stablePostArray[user] = []
                }
                if (bigArray.length > 0) {
                    console.log(bigArray.length + " of posts are here to send in finality")
                    bigArray = SortPostByLatest(bigArray)
                    if (bigArray.length > MaxPosts) {
                        userPosts = bigArray.slice(0, MaxPosts)
                        bigArray = bigArray.slice(MaxPosts, bigArray.length)
                    } else {
                        userPosts = bigArray;
                        bigArray = []
                        feedObject["accessedUsers"] = []
                    }
                    bigArray.map(post => {
                        if (!stablePostArray[post.username]) {
                            stablePostArray[post.username] = [post]
                        } else {
                            stablePostArray[post.username].push(post)
                        }
                    })
                    console.log("newly made stable post array is ")
                    console.log(stablePostArray)
                    feedObject["stablePostArray"] = stablePostArray
                    console.log("Now we will write ")
                    console.log(feedObject)
                    fs.writeFile((usersPath + email_username + "/feed/feed.json"), JSON.stringify(feedObject), (err) => {
                        if (err) {
                            console.log("Final feed.json New Write Error")
                        } else {
                            console.log("Issues resolved.")
                            res.send(userPosts)
                        }
                    })
                } else if (bigArray.length === 0) {
                    res.send([{
                        link: null,
                        caption: "You Have Reached the End of Your Feed.",
                        date: "7-9-2023",
                        time: [3, 17, 13]
                    }])
                }
            } else {
                accessedUsers.map(user => {
                    let range = MaxPosts - stablePostArray[user].length
                    //CHECKS IF ENOUGH POSTS ARE ALREADY IN THE STABLE POST ARRAY
                    if (range > 0 && !userPostDictionary[user]["endOfPosts"]) {
                        let fetch = userPostDictionary[user]["fetched"];
                        FetchUserPosts(email_username, user, fetch, range).then(resolvedPosts => {
                            stablePostArray[user] = stablePostArray[user].concat(resolvedPosts[0])
                            userPostDictionary[user]["fetched"] = resolvedPosts[1]
                            userPostDictionary[user]["endOfPosts"] = resolvedPosts[2]
                            traversed++
                            if (traversed === traversal) {
                                fs.readFile((usersPath + email_username + "/feed/feed.json"), (err, data) => {
                                    let dataJson = JSON.parse(data.toString())
                                    for (let user in stablePostArray) {
                                        bigArray = bigArray.concat(stablePostArray[user])
                                        stablePostArray[user] = []
                                    }
                                    bigArray = SortPostByLatest(bigArray)
                                    feedObject["userPostDictionary"] = userPostDictionary;
                                    if (bigArray.length > MaxPosts) {
                                        // console.log("big Array is bigger")
                                        userPosts = bigArray.slice(0, MaxPosts);
                                        bigArray = bigArray.slice(MaxPosts, bigArray.length)
                                    } else if (bigArray.length <= MaxPosts) {
                                        // console.log("bigArray is actually short")
                                        userPosts = bigArray
                                        bigArray = []
                                        dataJson["endOfFeed"] = true
                                    }
                                    bigArray.map(post => {
                                        if (!stablePostArray[post.username]) {
                                            stablePostArray[post.username] = [post]
                                        } else {
                                            stablePostArray[post.username].push(post)
                                        }
                                    })
                                    userPosts.map(post => {
                                        if (userPostDictionary[post.username]["endOfPosts"]) {
                                            accessedUsers = accessedUsers.filter(user => {
                                                return user !== post.username
                                            })
                                        }
                                    })
                                    feedObject["stablePostArray"] = stablePostArray;
                                    feedObject["accessedUsers"] = accessedUsers
                                    fs.writeFile((usersPath + email_username + "/feed/feed.json"), JSON.stringify(feedObject), (err) => {
                                        if (err) {
                                            console.log("Failed in final feed.json write.")
                                        } else {
                                            res.send(SortPostByLatest(userPosts))
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}


const InitUserPostDict = (username, following) => {
    return new Promise((resolve, reject) => {
        fs.readFile((usersPath + username + "/feed/feed.json"), (err, data) => {
            if (err) {
                console.log("Couldn't read User Feed Json to set post dictionary")
            } else {
                let dataJson = {
                    userPostDictionary: {}, stablePostArray: {}, firstAccess: false, accessedUsers: [], endOfFeed: true,
                };
                following.map((user) => {
                    dataJson["userPostDictionary"][user] = {
                        fetched: 0, endIn: MaxPosts, endOfPosts: false,
                    };
                    dataJson["stablePostArray"][user] = [];
                })
                fs.writeFile((usersPath + username + "/feed/feed.json"), JSON.stringify(dataJson), (err) => {
                    if (err) {
                        reject()
                        console.log("Couldn't InitUserPostDict up.")
                    } else {
                        resolve(dataJson)
                    }
                })
            }
        })
    })
}


const ReadFollowers = (username) => {
    return new Promise((resolve, reject) => {
        fs.readFile((usersPath + username + "/preferences/following.json"), (err, data) => {
            if (err) {
                console.log("Fail before begin")
            } else {
                let dataJson = JSON.parse(data.toString())
                resolve(dataJson)
            }
        })
    })
}

//FETCH POSTS, WRITE POSTS TO FEED.JSON FILE, EDIT IN END_OF_POSTS IF APPLICABLE
//
const FetchUserPosts = (forUser, username, fetchCount, range) => {
    let postArray = [];
    let endOfPosts = false;
    let newPostArray = {}
    newPostArray[username] = []
    return new Promise((resolve, reject) => {
        fs.readFile((usersPath + username + "/posts/posts.json"), (err, data) => {
            if (err) {
                console.log("Could Not Load " + username + " posts.json File")
            } else {
                let postDataJson = JSON.parse(data.toString())
                const limit = fetchCount + range
                if (postDataJson.length > limit) {
                    for (let i = fetchCount; postDataJson[i] && i < limit; i++) {
                        // console.log("Fetching " + fetchCount + " for " + username)
                        postArray = postArray.concat(postDataJson[i]);
                        fetchCount++
                    }
                } else if (postDataJson.length < limit) {
                    // console.log("Too Few Posts...")
                    for (let i = fetchCount; postDataJson[i]; i++) {
                        postArray = postArray.concat(postDataJson[i])
                        fetchCount++
                    }
                    endOfPosts = true;
                } else if (postDataJson.length === limit) {
                    for (let i = fetchCount; postDataJson[i]; i++) {
                        postArray = postArray.concat(postDataJson[i]);
                        fetchCount++
                    }
                    endOfPosts = true;
                }
                newPostArray[username] = newPostArray[username].concat(postArray)
                resolve([postArray, fetchCount, endOfPosts])
            }
        })
    })
}

module.exports = {GetFeedPosts, MoreFeedPosts}