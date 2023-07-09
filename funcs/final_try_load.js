// const fs = require("fs")
// const {usersPath} = require("./paths.js")
//
// const {PrivilegedUser} = require("./check_privilege.js")
// const {SortPostByLatest} = require("./try_sort")
// const MaxPosts = 4
//
//
// const GetFeedPosts = (req, res) => {
//     const email_username = req.cookies.user;
//     const cookie_hash = req.cookies["seltzer"];
//     console.log("Username is " + email_username + " and the Cookie Hash is " + cookie_hash);
//     PrivilegedUser(req).then(privy => {
//         if (!privy) {
//             res.redirect("/")
//         } else {
//             return ReadFollowers(email_username)
//         }
//     }).then(following => {
//         // following.push(email_username)
//         InitUserPostDict(email_username, following).then(feedObject => {
//             FirstFeedPosts(email_username, feedObject, following).then((bA) => {
//                 res.send(bA.flat(1))
//             })
//         })
//     })
// }
//
//
// const FirstFeedPosts = (email_username, feedObject, following) => {
//     let {userPostDictionary, stablePostArray} = feedObject
//     console.log("StablePostArray is ")
//     console.log(stablePostArray)
//     const traversal = Object.keys(userPostDictionary).length
//     let traversed = 0
//     let selfDict = {}
//     return new Promise((resolve, reject) => {
//         following.map(user => {
//             const endIn = userPostDictionary[user]["endIn"]
//             const fetched = userPostDictionary[user]["fetched"]
//             console.log("First fetched for " + user + " is " + fetched + " and will range to " + endIn)
//             selfDict[user] = {
//                 fetched: 0,
//                 endOfPosts: ""
//             }
//             FetchUserPosts(email_username, user, fetched, endIn).then((resolvedData) => {
//                 console.log("Resolution for " + user + " is")
//                 console.log(resolvedData)
//                 stablePostArray[user] = resolvedData[0]
//                 console.log("Fetched " + resolvedData[1] + ' posts for ' + user)
//                 selfDict[user]["fetched"] = resolvedData[1]
//                 selfDict[user]["endOfPosts"] = resolvedData[2]
//                 console.log("EndofPosts for " + user + " is " + resolvedData[2])
//                 // selfDict[user]["endIn"] =
//                 traversed++
//                 //IF ALL FOLLOWED USERS' POST HAVE BEEN FETCHED...
//                 if (traversed === traversal) {
//                     console.log("traversed is EQUAL TO traversal")
//                     console.log(stablePostArray)
//                     EqualizeFeedJson(email_username, stablePostArray, selfDict).then((posts) => {
//                         resolve(posts)
//                     })
//                 }
//             })
//         })
//     })
// }
//
//
// const EqualizeFeedJson = (email_username, stablePostArray, userSelfDict) => {
//     console.log()
//     return new Promise((resolve, reject) => {
//         fs.readFile((usersPath + email_username + "/feed/feed.json"), (err, data) => {
//             let dataJson = JSON.parse(data.toString())
//             console.log("Here's what we will write changes to: ")
//             console.log(dataJson)
//             for (let user in dataJson["userPostDictionary"]) {
//                 if (!userSelfDict[user]) {
//                     delete dataJson["userPostDictionary"][user]
//                 } else {
//                     dataJson["userPostDictionary"][user] = {...dataJson["userPostDictionary"][user], ...userSelfDict[user]}
//                 }
//             }
//             dataJson["firstAccess"] = false
//             console.log("to be written will be: ")
//             let oneBigArray = []
//             Object.keys(stablePostArray).map(user => {
//                 oneBigArray = oneBigArray.concat(stablePostArray[user])
//             })
//             oneBigArray = SortPostByLatest(oneBigArray.flat(1))
//             let userPosts = []
//             //Map over all username keys and take all posts, put them in
//             //one big array. The sort it, get latest [5] posts, put all others in stable post array
//             //also write to file which users' posts were sent
//             if (oneBigArray.length > MaxPosts) {
//                 userPosts = oneBigArray.slice(0, MaxPosts);
//                 oneBigArray = oneBigArray.slice(MaxPosts, oneBigArray.length)
//             } else if (oneBigArray.length <= MaxPosts) {
//                 userPosts = oneBigArray
//                 oneBigArray = []
//                 dataJson["endOfFeed"] = true
//             }
//             let stablePostObj = {}
//             oneBigArray.map(post => {
//                 if (stablePostObj[post.username]) {
//                     stablePostObj[post.username].push(post)
//                 } else {
//                     stablePostObj[post.username] = [post]
//                 }
//             })
//             userPosts.map(post => {
//                 if (!stablePostObj[post.username]) {
//                     stablePostObj[post.username] = []
//                 }
//             })
//             console.log("stablePostObj is ")
//             console.log(stablePostObj)
//             dataJson["stablePostArray"] = stablePostObj
//             for (let user in dataJson["userPostDictionary"]) {
//                 if (!stablePostObj[user] && dataJson["userPostDictionary"][user]["endOfPosts"]) {
//                     delete dataJson["userPostDictionary"][user]
//                 } else {
//                     if (!dataJson["accessedUsers"].includes(user)) {
//                         dataJson["accessedUsers"].push(user)
//                     }
//                 }
//             }
//             fs.writeFile((usersPath + email_username + "/feed/feed.json"), JSON.stringify(dataJson), (err) => {
//                 if (err) {
//                     console.log("Final write error.")
//                 } else {
//                     resolve(userPosts)
//                     console.log(dataJson)
//                 }
//             })
//         })
//     })
// }
//
//
// const MoreFeedPosts = (req, res) => {
//     const email_username = req.cookies.user;
//     let bigArray = []
//     let userPosts = []
//     PrivilegedUser(req).then((privy) => {
//         if (privy)
//             return new Promise((resolve, reject) => {
//                 fs.readFile(usersPath + email_username + "/feed/feed.json", (err, data) => {
//                     resolve(JSON.parse(data.toString()))
//                 })
//             })
//         else {
//             res.send({access: "denied"})
//         }
//     }).then(feedObject => {
//         console.log("In loadMoreFeedPosts func... the feedObject is...")
//         console.log(feedObject)
//         let {accessedUsers, userPostDictionary, stablePostArray} = feedObject;
//         let traversal = 0;
//         for (let user in userPostDictionary) {
//             if (!userPostDictionary[user]["endOfPosts"]) {
//                 traversal++
//             }
//         }
//         //SAVE CHANGES TO
//         return new Promise((resolve, reject) => {
//             let traversed = 0;
//             accessedUsers.map(user => {
//                 let range = MaxPosts - stablePostArray[user].length
//                 if (range > 0 && !userPostDictionary[user]["endOfPosts"]) {
//                     let fetch = userPostDictionary[user]["fetched"];
//                     console.log(user + " will fetch only " + range + " of posts from no." + fetch + " to " + (range + fetch))
//                     FetchUserPosts(email_username, user, fetch, range).then(resolvedPosts => {
//                         console.log("Resolved posts for " + user + " are")
//                         console.log(resolvedPosts)
//                         bigArray = bigArray.concat(resolvedPosts[0])
//                         // bigArray = bigArray.concat(stablePostArray[user])
//                         stablePostArray[user] = stablePostArray[user].concat(resolvedPosts[0])
//                         userPostDictionary[user]["fetched"] = resolvedPosts[1]
//                         userPostDictionary[user]["endOfPosts"] = resolvedPosts[2]
//                         traversed++
//                         if (traversed === traversal) {
//                             fs.readFile((usersPath + email_username + "/feed/feed.json"), (err, data) => {
//                                 let dataJson = JSON.parse(data.toString())
//                                 console.log("AGAIN, traversed IS EQUAL TO traversal")
//                                 console.log("userPostDictionary is ")
//                                 console.log(userPostDictionary)
//                                 console.log("More of the posts are...")
//                                 console.log(bigArray)
//                                 feedObject["userPostDictionary"] = userPostDictionary;
//                                 feedObject["stablePostArray"] = stablePostArray;
//                                 if (bigArray.length > MaxPosts) {
//                                     userPosts = bigArray.slice(0, MaxPosts);
//                                     bigArray = bigArray.slice(MaxPosts, bigArray.length)
//                                 } else if (bigArray.length <= MaxPosts) {
//                                     userPosts = bigArray
//                                     bigArray = []
//                                     dataJson["endOfFeed"] = true
//                                 }
//                                 bigArray.map(post => {
//                                     if (userPostDictionary[post.username]["endOfPosts"]) {
//                                         console.log("For now, end of line for " + user)
//                                         accessedUsers.splice(accessedUsers.indexOf(user), accessedUsers.indexOf(user) + 1)
//                                     }
//                                 })
//                                 feedObject["accessedUsers"] = accessedUsers
//                                 console.log("feed_object to write will be ")
//                                 console.log(feedObject)
//                                 res.send(SortPostByLatest(userPosts))
//                             })
//                         }
//                     })
//                 }
//             })
//             return
//         })
//     }).then(postArray => {
//         console.log("New Posts are...")
//         console.log(postArray)
//         res.send(postArray)
//     })
// }
//
//
// const ReadFirstAccess = (username) => {
//     return new Promise((resolve, reject) => {
//         fs.readFile((usersPath + username + "/feed/feed.json"), (err, data) => {
//             if (err) {
//                 console.log("Couldn't read First Access")
//             } else {
//                 let dataJson = JSON.parse(data.toString())
//                 resolve(dataJson["firstAccess"])
//             }
//         })
//     })
// }
//
//
// const InitUserPostDict = (username, following) => {
//     return new Promise((resolve, reject) => {
//         fs.readFile((usersPath + username + "/feed/feed.json"), (err, data) => {
//             if (err) {
//                 console.log("Couldn't read User Feed Json to set post dictionary")
//             } else {
//                 let dataJson = JSON.parse(data.toString());
//                 following.map((user) => {
//                     dataJson["userPostDictionary"][user] = {
//                         fetched: 0,
//                         endIn: MaxPosts,
//                         endOfPosts: false,
//                     };
//                     dataJson["stablePostArray"][user] = [];
//                     dataJson["firstAccess"] = false;
//                     dataJson["accessedUsers"] = []
//                 })
//                 fs.writeFile((usersPath + username + "/feed/feed.json"), JSON.stringify(dataJson), (err) => {
//                     if (err) {
//                         reject()
//                         console.log("Couldn't InitUserPostDict up.")
//                     } else {
//                         resolve(dataJson)
//                     }
//                 })
//             }
//         })
//     })
// }
//
//
// const ReadFollowers = (username) => {
//     return new Promise((resolve, reject) => {
//         fs.readFile((usersPath + username + "/preferences/following.json"), (err, data) => {
//             if (err) {
//                 console.log("Fail before begin")
//             } else {
//                 let dataJson = JSON.parse(data.toString())
//                 resolve(dataJson)
//             }
//         })
//     })
// }
//
// //FETCH POSTS, WRITE POSTS TO FEED.JSON FILE, EDIT IN END_OF_POSTS IF APPLICABLE
// //
// const FetchUserPosts = (forUser, username, fetchCount, range) => {
//     let postArray = [];
//     let endOfPosts = false;
//     let newPostArray = {}
//     newPostArray[username] = []
//     return new Promise((resolve, reject) => {
//         fs.readFile((usersPath + username + "/posts/posts.json"), (err, data) => {
//             if (err) {
//                 console.log("Could Not Load " + username + " posts.json File")
//             } else {
//                 let postDataJson = JSON.parse(data.toString())
//                 const limit = fetchCount + range
//                 if (postDataJson.length > limit) {
//                     for (let i = fetchCount; postDataJson[i] && i < limit; i++) {
//                         console.log("Fetching " + fetchCount + " for " + username)
//                         postArray = postArray.concat(postDataJson[i]);
//                         fetchCount++
//                     }
//                 } else if (postDataJson.length < limit) {
//                     console.log("Too Few Posts...")
//                     for (let i = fetchCount; postDataJson[i]; i++) {
//                         postArray = postArray.concat(postDataJson[i])
//                         fetchCount++
//                     }
//                     endOfPosts = true;
//                 } else if (postDataJson.length === limit) {
//                     for (let i = fetchCount; postDataJson[i]; i++) {
//                         postArray = postArray.concat(postDataJson[i]);
//                         fetchCount++
//                     }
//                     endOfPosts = true;
//                 }
//                 newPostArray[username] = newPostArray[username].concat(postArray)
//                 resolve([postArray, fetchCount, endOfPosts])
//             }
//         })
//     })
// }
//
// module.exports = {GetFeedPosts, MoreFeedPosts}