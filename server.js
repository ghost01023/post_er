const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const upload = multer();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
const cookieParser = require("cookie-parser");
app.use(cookieParser())
const mysql = require("mysql");

/////////////////////////
//IMPORT CUSTOM MODULES
/////////////////////////

const {AddUser} = require("./funcs/make_user")
const {usersPath, localPath, sessionPath} = require("./funcs/paths")
const {GetFeedPosts} = require("./funcs/load-feed-posts")
const {AuthenticateUser} = require("./funcs/authenticate_user")
const database = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'people_data'
})


app.listen(5000, () => {
    console.log("Listening on PORT 5000...")
})


//CHECKS IF COOKIE CONTAINS LOGIN === TRUE AND IF TRUE, LOADS FEED PAGE
//OTHERWISE, LOADS THE SIGNUP-LOGIN PAGE INSTEAD
//VERIFY USER IDENTITY BY SENDING A RANDOMLY GENERATED 50 CHARACTER HASH
//FOR THEIR CURRENT SESSION AND IF USER LOGS OUT, COOKIE IS REMOVED
//AND USER ACTIVE SESSION STATUS IS REMOVED FROM SESSION.JSON FILE
//[for now, also console.log the users name on server to see if it works]


app.get(["/", "/signup", "/login"], (req, res) => {
    if (req.cookies["seltzer"]) {
        app.use(express.static(__dirname + "/public/feed"))
        res.sendFile(__dirname + "/public/feed/feed.html");
    } else {
        console.log("Cookies Not Found!");
        app.use(express.static(__dirname + "/public/login-signup"))
        res.sendFile(__dirname + "/public/login-signup/login-signup.html");
    }
})


app.get("/feed-posts", GetFeedPosts)

//POST METHOD FOR WHEN A USER UPLOADS THEIR POSTS

app.get("/upload", (req, res) => {
    app.use(express.static(__dirname + "/public/create-post"));
    res.sendFile(__dirname + "/public/create-post/create-post.html");
})

//POST METHOD FOR A SIGN-UP FORM FOR USER

app.post("/register", (req, res) => {
    // app.use(express.static(__dirname + "/public/login-signup"));
    // res.sendFile(__dirname + '/public/login-signup/login-signup.html');
    res.redirect("/")
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    AddUser(username, email, password, res)
})

app.post("/authenticate", upload.none(), AuthenticateUser)

app.post("/login", upload.none(), async (req, res) => {
    app.use(express.static(__dirname + "/public/feed"))
    res.redirect("/")
    //COOKIE HAS BEEN SENT
    //NOW USER LOCAL SCRIPT WILL MAKE FETCH REQUEST WITH COOKIE
    //HASH AND UPON AUTHENTICATION, THE USER'S PARTICULAR
    //FEED WILL BE LOADED
})

//CREATE FUNCTION TO CREATE USER FEED [also privileged action]
// FOR SENDING TO THE CONSTRUCT PAGE
//CONSTRUCT RANDOM GEN HASH COOKIE SEND IT TO USER
//THIS COOKIE WILL BE USED TO VERIFY THE USER'S PRIVILEGES
//WHENEVER HE LIKES, COMMENTS, POSTS, FOLLOWS ETC.
//STORE DATA OF COOKIE HASHES INSIDE THE SESSION/COOKIE_USERS.JSON
//EACH TIME PRIVILEGE ACTION REQUEST IS MADE, IT IS MADE WITH USER
//NAME INTACT AND COOKIE IS ALSO SENT TO SERVER THAT CROSS-CHECKS
//COOKIE AGAINST USERNAME IN SESSION/COOKIE_USERS.JSON AND IF FOUND TRUE,
//LETS USER PERFORM ACTION AND MODIFIES HIS PROFILE FOLDER ACCORDINGLY
// res.send("Your name was found!")


//A VARIED FUNCTION THAT ADDS A NEW USER AND IS CALLED FROM THE SIGNUP
//FORM POST METHOD

//DELETES A USER FROM THE DATABASE ALONG WITH THEIR
//POSTS AND PROFILE INFORMATION ALTOGETHER

async function DeleteUser(email_username, password) {
    const profileDeleteInstructions = `DELETE FROM profile WHERE 
(profile.username = "${email_username}" OR profile.email = "${email_username}") 
AND profile.password = "${password}"`;
    console.log("checked!");
    fs.rmdirSync((usersPath + email_username), (err) => {
            if (err) {
                console.log(err)
            }
        }
    );
    database.query(profileDeleteInstructions, (err) => {
        if (err) {
            console.log(err);
            console.log('Error occurred during deletion')
        } else {
            console.log("Your profile was deleted successfully!");
        }
    })
}

//FUNCTION THAT RETURNS TRUE IF USER HAS REGISTERED PRIVILEGES
//SO THAT HE CAN PERFORM ACTIONS SPECIFIC TO HIS PROFILE.
//THESE ACTIONS INCLUDE:
//1. LOADING FEED,
//2. FOLLOWING AND UNFOLLOWING PEOPLE TO INDIRECTLY MODIFY HIS
//   FOLLOWING JSON FILE
//3. POSTING AND DELETING POSTS TO INDIRECTLY MODIFY HIS
//   POSTS JSON FILE
//4. COMMENTING ON POSTS
//5. LIKING POSTS
//6. EDITING HIS OWN PROFILE SUCH AS DISPLAY NAME (nickname?) ??
//7. BEING ABLE TO SET PROFILE PICTURE

const PrivilegedUser = (req) => {

    return true
}


//EVALUATES WHETHER THE REQUEST IS AN IMAGE REQ
const IfImageSearch = (url) => {
    if (url.substring(url.length - 4, url.length) === ".png") {
        if (url.substring(0, localPath.length) === localPath) {
            return true
        }
    }
    return false
}


//FUNCTION TO CONVERT LOCAL-SERVER URL TO END-USER URL
const LocalToEnd = (url) => {
    const sliceAway = usersPath.length;
    const newEx = url.substring(sliceAway, url.length);
    let startIndex = newEx.indexOf("images/");
    const finalEx = newEx.substring(0, startIndex) + newEx.substring(startIndex, newEx.length);
    return localPath + finalEx;
}

//FUNCTION TO CONVERT END-USER URL TO LOCAL-SERVER URL
const EndToLocal = (url) => {
    const sliceAway = "http://localhost:5000/users/".length;
    const newEx = url.substring(sliceAway, url.length);
    return usersPath + newEx
}

//FUNCTION TO REMOVE SESSION COOKIES OF USER FORM USER_COOKIE.JSON
const DeleteCookies = (email_username) => {
    fs.readFile((sessionPath + "/cookie_users.json"), (err, data) => {
        if (err) {
            console.log(err)
        } else {
            let data_json = JSON.parse(data.toString());
            delete data_json[email_username];
            fs.writeFile((sessionPath + "/cookie_users.json"), JSON.stringify(data_json), (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    })
}


//CATCH-ALL ROUTE
app.get("/users/*", (req, res) => {
    let Query = req.url.includes("http://") ? req.url : "http://localhost:5000" + req.url;
    Query = Query.replaceAll("%20", " ");
    if (IfImageSearch(Query)) {
        console.log(Query);
        fs.readFile(EndToLocal(Query), (err, content) => {
            if (err) return err
            res.end(content);
        })
    } else {
        res.send("<h1>Error 404. Page not found!</h1>");
    }
})


module.exports = {database, usersPath}