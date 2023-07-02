//SEND RAW-SET JSON FILE TO USER WHICH CONTAINS [[[{{((20))}}]]] POST DATA
const GetFeedPosts = (req, res) => {
    const email_username = req.cookies.user;
    const cookie_hash = req.cookies["seltzer"];
    console.log(email_username + cookie_hash);
    if (!email_username || !cookie_hash) {
        // app.use(express.static(__dirname + "/public/login-signup"))
        // res.sendFile((__dirname + "/public/login-signup/login-signup.html"), {headers: {
        //     }})
        res.redirect("/")
        console.log("Redirected because email_username or cookie_hash or both were" +
            "not found")
        return
    }
    console.log("and now feed posts are being called!")
    res.send("Feed incoming...")
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



module.exports = { GetFeedPosts }