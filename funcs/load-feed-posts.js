const fs = require("fs")
const {usersPath} = require("./paths.js")

//SEND RAW-SET JSON FILE TO USER WHICH CONTAINS [[[{{((20))}}]]] POST DATA
const {PrivilegedUser} = require("./check_privilege.js")
const {SortPostByLatest} = require("./try_sort")

const GetFeedPosts = (req, res) => {
    const email_username = req.cookies.user;
    const cookie_hash = req.cookies["seltzer"];
    console.log("Username is " + email_username + " and the Cookie Hash is " + cookie_hash);
    console.log("Sending First 2 Feed Posts As JSON...")
    let userPostDictionary = {}
    let allPosts = [];
    let extractedPosts = [];
    let final20Posts = [];
    //CHECK IF USER HAS PRIVILEGE TO LOAD FEED THROUGH COOKIES CROSS-CHECK
    PrivilegedUser(req).then(privy => {
        if (!privy) {
            res.redirect("/")
        } else if (privy) {
            return new Promise((resolve, reject) => {
                fs.readFile((usersPath + email_username + "/preferences/following.json"), (err, data) => {
                        if (err) {
                            res.send({
                                statusCode: 403,
                                statusMessage: "Failed to fetch feed"
                            })
                        } else {
                            const data_json = JSON.parse(data.toString());
                            console.log("User Follows These Other Users...")
                            console.log(data_json)
                            resolve(data_json)
                        }
                    }
                )
            })
        }
    }).then(async following => {
        following.map(user => {
            userPostDictionary[user] = {
                fetched: 0, //SET IT TO DIFF AMOUNT
                endIn: 2, //SET IT TO DIFF RANGE (BOTH BASED ON USER FEED JSON DATA INPUT). BUT LATER
                endOfPosts: false
            }
        })
        return await following.map(async user => {
            if (userPostDictionary[user]) {
                return await LoadPost(user, userPostDictionary[user]["fetched"], userPostDictionary[user]["endIn"])
                    .then((dat) => {
                        // allPosts = allPosts.concat(dat)
                        allPosts.push(dat)
                        console.log(allPosts)
                        return dat
                    });
            }
        })
    }).then(() => {
        console.log("For this one is ")
        console.log(allPosts)
        //REMOVE USERS FROM FOLLOWED(s) LIST ARRAY IF END_OF_POSTS FOR USER ELSE MODIFY USER_POST_DICTIONARY TO UPDATE
        //USER FETCH NUMBER AND MODIFY RANGE TO BE 1 IF FIRST ITERATION HAS BEEN DONE AND WE ARE ALREADY PAST THAT
        return allPosts.map((userPosts, index) => {
            let name = userPosts[0][0]["username"];
            //DEAL WITH ITEM 3 OF ARRAY
            //DEAL WITH ITEM 1 OF ARRAY
            extractedPosts = extractedPosts.concat(userPosts[0])
            if (userPosts[2]) {
                console.log("End of the line for this user")
                delete userPostDictionary[name]
            } else {
                //DEAL WITH ITEM 2 OF ARRAY
                userPostDictionary[name]["fetched"] = userPosts[1];
                userPostDictionary[name]["endIn"] = 1;
                // MODIFY THE END_IN TO 1 AFTER
                // LATEST POST HAS BEEN DISCOVERED ALREADY AND THEN DO IT AFTER WE FIGURE OUT WHICH USER'S POST TO TAKE OUT
                //OF THE ALL_POSTS ARRAY AND ADD IN ONE MORE POST OF THE SAME USER AND SO ON AND SO FORTH
                console.log("userPosts dict is now ")
                console.log(userPostDictionary)
            }
        })
    }).then(() => {
        console.log("Extracted raw post json is ")
        console.log(extractedPosts)
        console.log("Sorted posts are ")
        console.log(SortPostByLatest(extractedPosts))
        res.send(SortPostByLatest(extractedPosts))
        //SORT THE POSTS FROM LATEST TO EARLIEST AND THEN SEND FILE OUT (for now)

    })
    //     .then(data => {
    //     console.log("Posts finally are ")
    //     console.log(data)
    // })
    //GET AMOUNT OF POSTS IN RANGE(FETCHED, RANGE) AND PUSH THEM INTO
    // followers.map(follower => {

}
// followers.map((follower, index) =>
//     FetchNextPost(follower).then(data => {
//         foll_data.push(data)
//         if (index + 1 === len) {
//             resolve(foll_data)
//         }
//     })
// ))
// .then(posts => {
// console.log(typeof (posts))
// console.log("Fetched Two Posts Are...")
// posts.map(post => {
//     console.log(post)
// })
// res.send(posts)
// }))

// console.log("first twenty posts are ")
// console.log(first_twenty_posts)

// console.log("final twenty posts will be as this: ")
// console.log(final_twenty_posts)
// res.send('{"serverResp": "Feed incoming..."}')
// const Post = require(usersPath + currentUser + "/feed");
//ACCESSES FEED JSON
//FILE

//ACQUIRE IN RAW MANNER THE FOLLOWING OF LOGGED_IN_USER
// const Following = require(usersPath + currentUser + "/following");
//PARSE THEIR POSTS BY MAPPING OVER THE FOLLOWED USERS,
//BROWSING TO THEIR LOCATIONS [THROUGH THE SERVER ONLY]
//[AND THEIR IMAGES FOLDER ONLY FOR NOW]
//GET NAME OF IMAGE WHICH WILL HAVE BEEN PUSHED INTO POSTS.JSON
//WHEN THE POST HAS BEEN CREATED BY USER [FOR NOW, WE'LL JUST
//USE RAW LOCATORS]
// [REGARDLESS OF DATE [FOR NOW]],
//ONLY ALPHABETICALLY
// let post_array = [];
// Following["following"].map((followed_user, index) => {
//     const user_post_json = require(usersPath + followed_user + "/posts");
//     post_array.push("http://localhost:5000/users/" + followed_user + user_post_json[0]["link"]);
// })
// res.send(post_array);


//FUNCTION TO LOAD AS MANY POSTS ARE PER RANGE AND FETCH REQUESTS AND GENERAL POST AVAILABILITY

const LoadPost = async (username, fetchCount, range) => {
    let postArray = [];
    let endOfPosts = false;
    let dataJson = await fs.readFileSync((usersPath + username + "/posts/posts.json"), (err, data) => {
        if (err) {
            console.log("Could Not Load " + username + " posts.json File")
        } else {
            return data
        }
    })
    dataJson = JSON.parse(dataJson.toString())
    if (dataJson.length > fetchCount) {
        let limit = fetchCount + range;
        for (let i = fetchCount; i < limit; i++) {
            postArray = postArray.concat(dataJson[i]);
            fetchCount++
        }
    }
    if (dataJson.length === fetchCount) {
        endOfPosts = true;
    }
    console.log(username + "'s Post Array is ")
    console.log(postArray)
    return [postArray, fetchCount, endOfPosts]
}
// new Promise((resolve, reject) => {
//     fs.readFile((usersPath + username + "/posts/posts.json"), (err, data) => {
//         if (err) {
//             reject(new Error("Not Loading posts.json for " + username + " properly."))
//         }
//         resolve(JSON.parse(data.toString()));
//     })
// }).then(dataJson => {
//     console.log("Data json for " + username + " is:")
//     console.log(dataJson)
//
//     console.log("postArray is " + postArray)
//     return [postArray, fetchCount, endOfPosts]
// })
//
//
// const FetchNextPost = async (username, index) => {
//     return new Promise((resolve, reject) => fs.readFile((usersPath + "/" + username + "/posts/posts.json"), (err, data) => {
//         if (err) {
//             console.log("Failed to fetch followed user " + username + " 's  post list from his json file")
//         } else {
//             let data_json = JSON.parse(data.toString())
//             console.log(username + "'s posts are as follows: ")
//             console.log(data_json[0])
//             resolve(data_json[0])
//         }
//     }))
// }


module.exports = {GetFeedPosts, LoadPost}