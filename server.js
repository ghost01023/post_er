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

const {AddUser, DeleteUser} = require("./funcs/manage_user")
const {usersPath, localPath, sessionPath} = require("./funcs/paths")
const {GetFeedPosts} = require("./funcs/final_try_load")
const {AuthenticateUser} = require("./funcs/authenticate_user")
const {PrivilegedUser} = require("./funcs/check_privilege")
const { getCurrentDate } = require("./funcs/date_and_time")
const {gen_image_name} = require("./funcs/picture_name")
// const {LoadPost} = require("./funcs/try_load_feed_posts")
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

//SIMPLE FUNC TO GENERATE USER POST ID (7 CHARS LONG)
const genPostId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789-_";
    let id = ""
    for (let i = 0; i < 7; i++) {
        id += chars[Math.floor(Math.random() * 38)]
    }
    return id
}

//POST METHOD FOR WHEN A USER UPLOADS THEIR POSTS

const UploadPost = (req, res) => {
    let post_caption = req.body["new-post-caption"]
    if (post_caption.length === 0) {
        post_caption = null;
    }
    PrivilegedUser(req).then(privy => {
        if (privy) {
            return req.file.buffer;
        }
        if (!privy) {
            res.send("Sorry, You are not Authorized to Post!")
        }
    }).then(image_data => {
        const image_name = gen_image_name()
        fs.appendFileSync((usersPath + req.cookies.user + "/posts/images/" + image_name), (image_data), (err) => {
            if (err) {
                console.log("couldn't append image buffer data")
            } else {
                console.log("image successfully made!")
            }
        })
        return image_name
    }).then((image_name) => {
        fs.readFile((usersPath + req.cookies.user + "/posts/posts.json"), (err, data) => {
            if (err) {
                fs.rm((usersPath + req.cookies.user + "/posts/images/" + image_name), (err) => {
                    if (err) {
                        console.log("Failed Post Undo. Manual Adjustment Required.")
                    } else {
                        console.log("Reverted Post Image Directory Changes Back to Before Posting...")
                    }
                })
            } else {
                let data_json = JSON.parse(data.toString());
                let current_date = getCurrentDate()
                let {year, month, day, time} = current_date
                let post_id = genPostId()
                const post_object = {
                    id: post_id,
                    username: req.cookies.user,
                    link: "/images/" + image_name,
                    caption: post_caption,
                    date: `${year.toString()}-${month}-${day}`,
                    time: time
                }
                data_json.unshift(post_object)
                fs.writeFile((usersPath + req.cookies.user + "/posts/posts.json"), JSON.stringify(data_json), (err) => {
                        if (err) {
                            console.log("Couldn't add to posts.json after adding image post .png. Reverting File Changes.")
                            fs.rm((usersPath + req.cookies.user + "/posts/images/" + image_name), (err) => {
                                if (err) {
                                    console.log("Couldn't revert post image changes to before change." +
                                        "Manual Adjustment Required.")
                                } else {
                                    console.log("Deleted post image due to problems..")
                                }
                            })
                        } else {
                            res.redirect("/")
                            console.log("/posts.json file modified to reflect changes.")
                        }
                    }
                )
            }
        })
    })
}

app.post("/upload", upload.single("post-file"), UploadPost)
// app.use(express.static(__dirname + "/public/create-post"));
// res.sendFile(__dirname + "/public/create-post/create-post.html");

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
                res.send({privy: true})
            } else {
                res.send({privy: false})
            }
        })
    }
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
    console.log("Checking if image search...")
    if (url.substring(url.length - 4, url.length) === ".png") {
        console.log("Asking for some image...")
        if (url.substring(0, localPath.length) === localPath) {
            console.log("Image Fetch Request...")
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

// app.get("/*", (req, res) => {
//     res.send("Not Available.")
// })


//ROUTE TO SEND USER POSTS WHOLESALE WITH POSTS.JSON AND IMAGE LINKS
//ETC ETC

const getPostJson = (username, id) => {
    const location = usersPath + username + "/posts/posts.json";
    console.log("location is " + location)
    return new Promise((resolve, reject) => {
        fs.readFile(location, (err, data) => {
            let data_json = JSON.parse(data.toString());
            data_json.map(post => {
                console.log("Post id is " + post.id);
                console.log("ID is " + id)
                if (post.id.toString().toLowerCase() === id.toString().toLowerCase()) {
                    console.log("id matches up.")
                    resolve(post)
                }
            })
            reject()
        })
    })
}

app.get("/users/*/posts/*", (req, res) => {
    let url = req.url.split("/");
    let username = url[2];
    let post_link = url[4];
    console.log("Username is " + username + " and post_link is " + post_link)
    getPostJson(username, post_link).then(data => {
        console.log("Post data is ");
        console.log(data);
        res.send(data)
    }).catch(() => {
        res.send("404. Not found.")
    })
})


//ROUTE TO SEND IMAGE FILES THEMSELVES WHEREVER THEY ARE REQUESTED LIKE
//EARLY VERSION OF MORE OPEN INSTAGRAM

//FIRST WILDCARD IS USERNAME, THEN => REQUESTED_IMAGE_URL

app.get("/users/*/images/*", (req, res) => {
        const imgUrl = calculateImageUrl(req);
        return new Promise((resolve) => {
            fs.access((imgUrl), fs.constants.F_OK, err => {
                resolve(!err)
            })
        }).then((exists) => {
            if (exists) {
                res.sendFile(imgUrl)
            } else {
                console.log("Couldn't find file..." + imgUrl)
                res.send("Error 404. File not found!")
            }
        })
    }
)


const calculateImageUrl = (req) => {
    if (req.url.includes(".png") || req.url.includes(".jpeg")) {
        let spl = req.url.split("/");
        let username = spl[2];
        let imageLink = spl[4].replace("%20", " ");
        return usersPath + username + "/posts/images/" + imageLink
    }
}

//CATCH-ALL ROUTE(s)
// app.get("/*", (req, res) => {
//     res.redirect("/")
// })

app.get("/users/*", (req, res) => {
    res.send("<h1>Error 404. User not found!</h1>");
})


module.exports = {database, usersPath}


// proper request and response to login form from login-signup.html [DONE]
// |
// |-----as in, send cookie with hash [DONE]
// |
// |-----request user_feed after cookie has been received [DONE]
// |
// |--------send user_feed (in raw form for right now) [DONE]
//
//
// Redesign the end_to_local and local_to_end functions as needed for image fetches
// and also modify the ifImageSearch func to make it more versatile
// and more suited to the current database structuring of the new posts
// [ABANDONED. CHANGED  [RAW FUNC BODY INSTEAD. THE ETL AND LTC FUNC(S) THEMSELVES
// WERE NOT VERSATILE ENOUGH TO SUIT ENOUGH NEEDS TO JUSTIFY THEIR EXISTENCE] [DONE]
//
// also, figure out the proper composition of a post and how the data will be stored [DONE]
//
// also figure out how to extract date from posts for comparison -- lly, create function that
// sorts through posts [DONE]
// also, structure all profile folders in ONE PROPER MANNER so that every user is on the same page
// [MOSTLY DONE IN A HALFWAY-DECENT MANNER]

