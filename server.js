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

const {AddUser} = require("./funcs/manage_user")
const {usersPath, localPath, sessionPath} = require("./funcs/paths")
const {GetFeedPosts} = require("./funcs/load-feed-posts")
const {AuthenticateUser} = require("./funcs/authenticate_user")
const {PrivilegedUser} = require("./funcs/check_privilege")
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
    PrivilegedUser(req).then(privilege => {
        console.log(privilege)
        if (privilege === true) {
            app.use(express.static(__dirname + "/public/feed"))
            res.sendFile(__dirname + "/public/feed/feed.html");
        } else {
            console.log("Cookies Not Found!");
            app.use(express.static(__dirname + "/public/login-signup"))
            res.sendFile(__dirname + "/public/login-signup/login-signup.html");
        }
    })
})


app.get("/feed-posts", GetFeedPosts)

//POST METHOD FOR WHEN A USER UPLOADS THEIR POSTS

app.post("/upload", (req, res) => {
    PrivilegedUser(req).then(privy => {
        if (privy) {
            console.log("User has posting privileges")
        } else {
            console.log("User seems to have cleared cookies!")
            res.redirect("/")
        }
    })
    // app.use(express.static(__dirname + "/public/create-post"));
    // res.sendFile(__dirname + "/public/create-post/create-post.html");
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

app.get("/privilege", (req, res) => {
    PrivilegedUser(req).then(privy => {
        if (privy) {
            res.send("You are not the guy")
        } else {
            res.send("You are still not the guy")
        }
    })
    }
    //     res.send(new Promise((resolve) => {
    //         PrivilegedUser(req).then(privy => {
    //             if (privy) {
    //                 resolve(true)
    //             } else {
    //                 resolve(false)
    //             }
    //         })
    //     }).then(res => {
    //         console.log(res)
    //         console.log(typeof(res))
    //         return res
    //     }))
    // }
)


//WILL DELETE USER COOKIE SESSION DATA FROM JSON
//ALSO NEED TO ENABLE COOKIE CROSS CHECK IN THE FIRST PLACE
app.get("/rem-sesh", (req, res) => {
    // console.log(req);
    console.log("Logout Post Method Called!")
    // console.log(req.body)
    DeleteCookies(req.cookies["user"])
    console.log("Cleared your cookies here!")
    res.send({
        loggedOut: true
    })
})


app.post("/logout", (req, res) => {
    res.redirect("/")
})


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
        console.log("Accessing the cookie_users.json")
        if (err) {
            console.log(err)
        } else {
            let data_json = JSON.parse(data.toString());
            console.log(data_json)
            console.log(email_username)
            delete data_json[email_username];
            console.log(data_json)
            console.log("Removed user!")
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
        console.log("User has made an image fetch request...")
        fs.readFile(EndToLocal(Query), (err, content) => {
            if (err) {
                console.log(err)
            }
            res.end(content);
        })
    } else {
        res.send("<h1>Error 404. Page not found!</h1>");
    }
})


module.exports = {database, usersPath}