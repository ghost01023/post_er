// const fs = require("fs")
// const {usersPath} = require("./paths.js")
//
// const {PrivilegedUser} = require("./check_privilege.js")
// const {SortPostByLatest} = require("./try_sort")
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
//             return new Promise((resolve, reject) => {
//                 fs.readFile((usersPath + email_username + "/preferences/following.json"), (err, data) => {
//                     if (err) {
//                         console.log("Fail before begin")
//                     } else {
//                         let dataJson = JSON.parse(data.toString())
//                         resolve(dataJson)
//                     }
//                 })
//             })
//         }
//     }).then(following => {
//         InitUserPostDict(email_username, following).then(async (feedObject) => {
//             console.log("Resolved feed object is ")
//             console.log(feedObject)
//             // fs.readFile((usersPath + email_username + "/feed/feed.json"), (err, data) => {
//             //     let d = JSON.parse(data.toString())
//             //     console.log("PROOF...")
//             //     console.log(d)
//             // })
//             let {userPostDictionary, stablePostArray} = feedObject
//             const traversal = Object.keys(userPostDictionary).length
//             let traversed = 0
//             return new Promise((resolve, reject) => {
//                 if (feedObject["firstAccess"]) {
//                     following.map(user => {
//                         const fetched = userPostDictionary[user]["fetched"]
//                         const endIn = userPostDictionary[user]["endIn"]
//                         FetchUserPosts(email_username, user, fetched, endIn).then((postArray) => {
//                             stablePostArray[user] = postArray
//                             traversed++
//                             if (traversed === traversal) {
//                                 console.log("traversed is EQUAL TO traversal")
//                                 console.log(stablePostArray)
//                                 fs.readFile((usersPath + email_username + "/feed/feed.json"), (err, data) => {
//                                     let dataJson = JSON.parse(data.toString())
//                                     dataJson["stablePostArray"] = stablePostArray
//                                     fs.writeFile((usersPath + email_username + "/feed/feed.json"), JSON.stringify(dataJson), (err) => {
//                                         if (err) {
//                                             console.log("Final write error.")
//                                         } else {
//                                             console.log("Written into it...")
//                                             //Map over all username keys and take all posts, put them in
//                                             //one big array. The sort it, get latest [5] posts, put all others in stable post array
//                                             //also write to file which users' posts were sent
//                                             let oneBigArray = []
//                                             Object.keys(stablePostArray).map(user => {
//                                                 oneBigArray.push(stablePostArray[user])
//                                             })
//                                             oneBigArray = SortPostByLatest(oneBigArray.flat(1))
//                                             console.log("SORTED BY LATEST IS: ")
//                                             console.log(oneBigArray)
//                                             resolve(oneBigArray)
//                                         }
//                                     })
//                                 })
//                             }
//                         })
//                     })
//                 } else {
//                     //CHECK ON BASIS OF FIRST-ACCESS = FALSE
//                     console.log("Error")
//                 }
//             })
//         }).then(bigArr => {
//             console.log("bigArr is ")
//             console.log(bigArr.flat(1))
//             res.send(bigArr.flat(1))
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
//                         endIn: 20,
//                         endOfPosts: false,
//                     };
//                     dataJson["stablePostArray"][user] = [];
//                 })
//                 console.log("dataJson of feed is ")
//                 console.log(dataJson)
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
// //FETCH POSTS, WRITE POSTS TO FEED.JSON FILE, EDIT IN END_OF_POSTS IF APPLICABLE
// //
// const FetchUserPosts = (forUser, username, fetchCount, range) => {
//     let postArray = [];
//     let endOfPosts = false;
//     let newPostDictionary = {}
//     let newPostArray = {}
//     return new Promise((resolve, reject) => {
//         fs.readFile((usersPath + username + "/posts/posts.json"), (err, data) => {
//             if (err) {
//                 console.log("Could Not Load " + username + " posts.json File")
//             } else {
//                 let postDataJson = JSON.parse(data.toString())
//                 console.log(username + "'s posts.json file is ")
//                 console.log(postDataJson)
//                 const limit = fetchCount + range
//                 if (postDataJson.length > fetchCount) {
//                     for (let i = fetchCount; postDataJson[i] && i < limit; i++) {
//                         postArray = postArray.concat(postDataJson[i]);
//                         fetchCount++
//                     }
//                 } else if (postDataJson.length < fetchCount) {
//                     console.log("Too Few Posts...")
//                 }
//                 if (postDataJson.length === fetchCount) {
//                     endOfPosts = true;
//                 }
//                 fs.readFile((usersPath + forUser + "/feed/feed.json"), (err, feed) => {
//                     if (err) {
//                         console.log("Inside the func..")
//                     } else {
//                         let feedJson = JSON.parse(feed.toString());
//                         newPostDictionary[username]["fetched"] = fetchCount;
//                         newPostDictionary[username]["endOfPosts"] = endOfPosts;
//                         newPostArray[username] = newPostArray[username].concat(postArray)
//                         feedJson["userPostDictionary"][username]["fetched"] = fetchCount
//                         feedJson["userPostDictionary"][username]["endOfPosts"] = endOfPosts;
//                         feedJson["stablePostArray"][username] = feedJson["stablePostArray"][username].concat(postArray)
//                         fs.writeFile((usersPath + forUser + "/feed/feed.json"), (JSON.stringify(feedJson)), (err) => {
//                             if (err) {
//                                 console.log("Failed to write post array data")
//                             } else {
//                                 console.log("Post Array inside func... written successfully!")
//                                 resolve(postArray)
//                             }
//                         })
//                     }
//                 })
//
//             }
//         })
//     })
// }
//
// module.exports = {GetFeedPosts}