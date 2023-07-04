const fs = require("fs")
const {usersPath} = require("./paths.js")

//SEND RAW-SET JSON FILE TO USER WHICH CONTAINS [[[{{((20))}}]]] POST DATA
const {PrivilegedUser} = require("./check_privilege.js")

const GetFeedPosts = (req, res) => {
    const email_username = req.cookies.user;
    const cookie_hash = req.cookies["seltzer"];
    console.log("Username is " + email_username + " and the Cookie Hash is " + cookie_hash);
    console.log("Sending First 2 Feed Posts As JSON...")
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
    }).then(followers => new Promise((resolve, reject) => {
        let foll_data = []
        let len = followers.length
        followers.map((follower, index) =>
            FetchNextPost(follower).then(data => {
                foll_data.push(data)
                if (index + 1 === len) {
                    resolve(foll_data)
                }
            })
        )
    }).then(posts => {
        console.log(typeof (posts))
        console.log("Fetched Two Posts Are...")
        posts.map(post => {
            console.log(post)
        })
        res.send(posts)
    }))

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


const FetchNextPost = async (username, index) => {
    return new Promise((resolve, reject) => fs.readFile((usersPath + "/" + username + "/posts/posts.json"), (err, data) => {
        if (err) {
            console.log("Failed to fetch followed user " + username + " 's  post list from his json file")
        } else {
            let data_json = JSON.parse(data.toString())
            console.log(username + "'s posts are as follows: ")
            console.log(data_json[0])
            resolve(data_json[0])
        }
    }))
}


module.exports = {GetFeedPosts}