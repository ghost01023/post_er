const fs = require("fs")
const {usersPath} = require("./paths.js")

//SEND RAW-SET JSON FILE TO USER WHICH CONTAINS [[[{{((20))}}]]] POST DATA
const {PrivilegedUser} = require("./check_privilege.js")

const GetFeedPosts = (req, res) => {
    const email_username = req.cookies.user;
    const cookie_hash = req.cookies["seltzer"];
    console.log(email_username + cookie_hash);
    if (!email_username || !cookie_hash) {
        // app.use(express.static(__dirname + "/public/login-signup"))
        // res.sendFile((__dirname + "/public/login-signup/login-signup.html"), {headers: {
        //     }})
        res.send("<h1>Invalid Session</h1><h3>Try Refreshing the Page...</h3>")
        console.log("Redirected because email_username or cookie_hash or both were" +
            "not found")
        return
    }
    console.log("Sending First 2 Feed Posts As JSON...")
    PrivilegedUser(req).then(privy => {
        if (privy) {
            return new Promise((resolve, reject) => {
                fs.readFile((usersPath + email_username + "/following.json"), (err, data) => {
                        if (err) {
                            res.send({
                                statusCode: 403,
                                statusMessage: "Failed to fetch feed"
                            })
                        } else {
                            const data_json = JSON.parse(data.toString());
                            console.log("Reaidng data.json")
                            console.log(data_json)
                            resolve(data_json)
                        }
                    }
                )
            })
        }
    }).then(followers => {
        // let first_twenty_posts = [];
        //KEEP FILLING THE FINAL_TWENTY_POSTS ARRAY UNTIL IT IS OF SIZE 20, THEN SEND
        // while (final_twenty_posts.length < 2) {
        //     //COMPARE DATA VALUES (later)
        //     final_twenty_posts.push(first_twenty_posts[final_twenty_posts.length])
        // }
        return followers.map(follower => {
             return FetchNextPost(follower, 0)
        })
    }).then(posts => {
        console.log("posts are ")
        console.log(posts)
    })

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
}


const FetchNextPost = (username, index) => {
    return fs.readFile((usersPath + "/" + username + "/posts/posts.json"), (err, data) => {
        if (err) {
            console.log("Failed to fetch followed user " + username + " 's  post list from his json file")
        } else {
            let data_json = JSON.parse(data.toString())
            console.log(data_json)
            return data_json[index]
        }
    })
}


module.exports = {GetFeedPosts}