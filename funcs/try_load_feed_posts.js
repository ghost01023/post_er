// const fs = require("fs")
// const {usersPath} = require("./paths.js")
//
// const {PrivilegedUser} = require("./check_privilege.js")
// const {SortPostByLatest} = require("./try_sort")
//
// const GetFeedPosts = (req, res) => {
//     const email_username = req.cookies.user;
//     const cookie_hash = req.cookies["seltzer"];
//     console.log("Username is " + email_username + " and the Cookie Hash is " + cookie_hash);
//     let allPosts = [];
//     let extractedPosts = [];
//     PrivilegedUser(req).then(privy => {
//         if (!privy) {
//             res.redirect("/")
//         } else {
//             fs.readFile((usersPath + email_username + "/preferences/following.json"), (err, data) => {
//                 if (err) {
//                     console.log(err)
//                 } else {
//                     const followedJson = JSON.parse(data.toString());
//                     console.log("User Follows These Other Users...")
//                     console.log(followedJson)
//                     InitUserPostDict(email_username, followedJson)
//                         .then(async (feedJsonBlob) => {
//                             const {userPostDictionary} = feedJsonBlob
//                             return await followedJson.map(user => {
//                                 if (userPostDictionary[user]) {
//                                     console.log(user + " Exists.")
//                                     const {fetched, endIn} = userPostDictionary[user]
//                                     if (feedJsonBlob["firstAccess"]) {
//                                         // SetFeedJson(email_username, "firstAccess", false)
//                                         return FetchUserPosts(user, fetched, endIn)
//                                             .then((dat) => {
//                                                 console.log("To add is ")
//                                                 console.log(dat[0])
//                                                 SetFeedStablePostArray(email_username, [user, dat[0]])
//                                                 allPosts.push(dat)
//                                             });
//                                     } else {
//
//                                     }
//                                 }
//                             })
//                         }).then((userPostDictionary) => {
//                         console.log("All posts are ")
//                         console.log(allPosts)
//                         return allPosts.map(userPosts => {
//                             let name = userPosts[0][0]["username"];
//                             console.log("user name is " + name)
//                             extractedPosts = extractedPosts.concat(userPosts[0])
//                             if (userPosts[2]) {
//                                 console.log("End of the Line for this User (Their Posts have been exhausted.)")
//                                 delete userPostDictionary[name]
//                             } else {
//                                 console.log("BEFORE FETCHED: ")
//                                 console.log(userPostDictionary)
//                                 userPostDictionary[name]["fetched"] = userPosts[1];
//                                 userPostDictionary[name]["endIn"] = 1;
//                                 console.log("userPosts dict is now ")
//                                 console.log(userPostDictionary)
//                             }
//                             return userPosts[0]
//                         })
//                     }).then((eP) => {
//                             console.log("Extracted posts are ")
//                             console.log(eP)
//                             let sortedPosts = SortPostByLatest(extractedPosts)
//                             console.log(sortedPosts)
//                         let finalPosts = []
//                         for (let i = 0; sortedPosts[i]; i++) {
//                             finalPosts.push(sortedPosts[i]);
//                             if (i === 20) {
//                                 break;
//                             }
//                         }
//                             res.send(finalPosts)
//                         }
//                     )
//                 }
//             })
//         }
//     })
// }
//
// const ReadFeedJson = (username) => {
//     return new Promise((resolve, reject) => {
//         fs.readFile((usersPath + username + "/feed/feed.json"), (err, data) => {
//             if (err) {
//                 reject(new Error())
//                 console.log("Error encountered while opening the feed.json file...")
//             } else {
//                 let feed_data_json = JSON.parse(data.toString());
//                 console.log("FIRST: Feed data.json content is ")
//                 console.log(feed_data_json)
//                 resolve(feed_data_json)
//             }
//         })
//     })
// }
//
//
// const SetFeedStablePostArray = (username, value) => {
//     return new Promise((resolve, reject) => {
//         ReadFeedJson(username).then(dataJson => {
//             dataJson["stablePostArray"][value[0]] = value[1];
//             fs.writeFile((usersPath + username + "/feed/feed.json"), JSON.stringify(dataJson), (err) => {
//                 if (err) {
//                     reject()
//                 } else {
//                     resolve(true)
//                 }
//             })
//         })
//     })
// }
//
//
// const SetFeedJson = (username, field, value) => {
//     return new Promise((resolve, reject) => {
//         ReadFeedJson(username).then(dataJson => {
//             dataJson[field] = value;
//             fs.writeFile((usersPath + username + "/feed/feed.json"), JSON.stringify(dataJson), (err) => {
//                 if (err) {
//                     reject()
//                 } else {
//                     resolve(true)
//                 }
//             })
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
//                         endIn: 2,
//                         endOfPosts: false,
//                     }
//                     dataJson["stablePostArray"][user] = [""];
//                 })
//                 fs.writeFile((usersPath + username + "/feed/feed.json"), JSON.stringify(dataJson), (err) => {
//                     if (err) {
//                         reject()
//                         console.log("Couldn't InitUserPostDict up.")
//                     } else {
//                         console.log("InitUserPostDict ran successfully.")
//                         console.log("Post dictionary is now: ")
//                         console.log(dataJson)
//                         console.log("stable pot array is ")
//                         console.log(dataJson["stablePostArray"])
//                         resolve(dataJson)
//                     }
//                 })
//             }
//         })
//     })
// }
//
// const FetchUserPosts = async (username, fetchCount, range) => {
//     let postArray = [];
//     let endOfPosts = false;
//     let dataJson = await fs.readFileSync((usersPath + username + "/posts/posts.json"), (err, data) => {
//         if (err) {
//             console.log("Could Not Load " + username + " posts.json File")
//         } else {
//             return data
//         }
//     })
//     dataJson = JSON.parse(dataJson.toString())
//     const limit = fetchCount + range
//     if (dataJson.length > fetchCount) {
//         for (let i = fetchCount; dataJson[i] && i < limit; i++) {
//             postArray = postArray.concat(dataJson[i]);
//             fetchCount++
//         }
//     } else if (dataJson.length < fetchCount) {
//         console.log("Too Few Posts...")
//     }
//     if (dataJson.length === fetchCount) {
//         endOfPosts = true;
//     }
//     return new Promise((resolve, reject) => {
//         fs.readFile((usersPath + username + "/feed/feed.json"), (err, feed) => {
//             if (err) {
//                 console.log("Inside the func..")
//             } else {
//                 let feedJson = JSON.parse(feed.toString());
//                 console.log("feedJSON is ")
//                 console.log(feedJson)
//                 postArray.map(post => {
//                     console.log("BEFORE THE PUSH...")
//                     console.log(post)
//                     console.log(feedJson["stablePostArray"])
//                     // feedJson["stablePostArray"][username] += post
//                     console.log(typeof(feedJson["stablePostArray"][username]))
//                     feedJson["userPostDictionary"][username]["fetched"] = fetchCount;
//                     feedJson["userPostDictionary"][username]["endOfPosts"] = endOfPosts
//                 })
//                 console.log("After postArray mapping, feedJson is ")
//                 console.log(feedJson)
//                 // feedJson["stablePostArray"][username].
//                 fs.appendFile((usersPath + username + "/feed/feed.json"), (feedJson), (err) => {
//                     if (err) {
//                         console.log("Failed to write post array data")
//                     } else {
//                         console.log("Post Array inside func... written successfully!")
//                         resolve(postArray)
//                     }
//                 })
//             }
//         })
//     })
// }
//
//
// module.exports = {GetFeedPosts, LoadPost: FetchUserPosts}