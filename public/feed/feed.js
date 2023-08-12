//SOME CONSTANTS REFERRING TO HTML ELEMENTS

// Feed.innerHTML = "Hello there";
const PostHeading = document.createElement("h1");
const LogOutForm = document.querySelector(".log-out-form");
const PostButton = document.querySelector(".post-button");
const PostDiv = document.querySelector(".user-post");
const Feed = document.querySelector(".feed");
const PostDivForm = document.querySelector(".user-post form")
const PostNotPrivy = document.querySelector(".post-not-privy")
const LoadMorePostBtn = document.querySelector(".load-more-posts")

let shown_post_div = false
const Loading = document.querySelector(".loading")
// document.querySelector(".feed").innerHTML = "<div>Loading Posts...Please Wait...</div>"

LoadMorePostBtn.addEventListener("click", () => {
    fetch("/more-feed-posts").then(res => res.json()).then(data => {
        ConstructPage(data)
    })
})

PostButton.addEventListener("click", () => {
    if (shown_post_div) {
        PostDiv.style.visibility = "hidden";
        shown_post_div = false;
    } else {
        fetch("/privilege").then(res => res.json()).then(data => {
            if (data.privy === true) {
                PostDiv.style.visibility = "initial";
                shown_post_div = true;
            }
        })
    }
})

LogOutForm.addEventListener("submit", (event) => {
    event.preventDefault()
    console.log("Logging out...")
    fetch("/finish-session").then(res => res.json()).then(logoutStatus => {
        if (logoutStatus) {
            LogOutForm.submit();
        }
    })
})


//FUNCTION RUNS FOR FIRST TIME WHEN LOADING FEED PAGE,

//RUNS AND RE-RUNS EACH TIME THE USER SCROLLS TO THE
//END OF HIS FEED, UNTIL (OF COURSE) HE REACHES THE
//END OF ALL OF HIS FEED
const LoadPosts = () => {
    fetch("/feed-posts").then(res => res.json()).then(data => {
        Feed.removeChild(Loading)
        ConstructPage(data)
    })
}
LoadPosts()

let para = document.querySelector("h2");

para.innerHTML += document.cookie.substring(document.cookie.indexOf("=") + 1, document.cookie.indexOf(";"))

//FUNCTION TO PARSE RECEIVED JSON OF POST DATA

//AND CONSTRUCT PAGE LAYOUT BY ADDING POST ITEMS
//AND SETTING THEIR ATTRIBUTES AND IMAGE
//LINKS
const ConstructPage = (array) => {
    array.map(post => {
        console.log(post)
        if (post.end) {
            let End = document.createElement("h2")
            End.innerHTML = "You have reached the end of your feed."
            Feed.appendChild(End)
            return
        }
        const PostCard = document.createElement("div");
        PostCard.classList.add("post-card");
        const PostHeading = document.createElement("h1");
        PostHeading.innerText = post.caption;
        let PostImage = new Image()
        PostImage.src = "http://localhost:5000/users/" + post.username + post.link;
        PostCard.appendChild(PostImage);
        PostCard.appendChild(PostHeading);
        Feed.appendChild(PostCard);
    })
}


//FUNCTION THAT FETCHES USER DATA BASED ON SEARCH FOR USERS

const SearchUserField = document.querySelector("#search-users")
const SearchUserForm = document.querySelector(".search-user-form")
SearchUserField.addEventListener("input", (event) => {
    fetch("/user-search", {
        method: 'POST',
        body: new FormData(SearchUserForm),
    }).then(res => {
        console.log("Searching for users..." +
            "Please wait...")
        return res.json()
    }).then(data => {
        console.log("Are You Searching for: ")
        console.log(data)
        ConstructSearchArea(data)
    })
})


const SearchDiv = document.querySelector(".fetched-users")
const ConstructSearchArea = (array) => {
    SearchDiv.innerHTML = ""
    array.map(user => {
        let nameSection = document.createElement("div")
        let nameLabel = document.createElement("a")
        nameLabel.innerHTML = user.username
        nameLabel.classList.add("name-search")
        nameLabel.href = "http://localhost:5000/users/" + user.username.toLowerCase();
        nameSection.id = user.username
        nameSection.appendChild(nameLabel)
        SearchDiv.appendChild(nameSection)
    })
}


const ViewProfile = document.querySelector(".show-profile-info")
const ProfileDiv = document.querySelector(".user-info")
ViewProfile.addEventListener("click", () => {
    if (ProfileDiv.style.visibility === "initial") {
        ProfileDiv.style.visibility = "hidden";
    } else {
        ProfileDiv.style.visibility = "initial";
    }
})

ProfileDiv.addEventListener("mouseout", () => {
    // ProfileDiv.style.visibility = "hidden"
})


//CHATTING
const ChatBtn = document.querySelector(".chat-access")
const ChatScreen = document.querySelector(".chat-div")
const ChatList = document.querySelector(".chat-list")
const CloseChatList = document.querySelector(".close-chat-list")
const FeedPage = document.querySelector(".feed-page")
const UserPost = document.querySelector(".user-post")
ChatBtn.addEventListener("click", () => {
    ChatScreen.style.visibility = "initial";
    FeedPage.style.filter = "blur(3px) brightness(0.7)"
    UserPost.style.filter = "blur(3px) brightness(0.7)"
    fetch("/chats").then(res => {
        return res.json()
    }).then(people => {
        if (people.length > 0) {
            ChatList.innerHTML = ""
        }
        people.map(person => {
            let div = document.createElement("div")
            div.classList.add("chat-" + person)
            div.innerText = person
            ChatList.appendChild(div)
            console.log("Chatted with " + person)
        })
    })
})

CloseChatList.addEventListener("click", () => {
    ChatScreen.style.visibility = "hidden";
    FeedPage.style.filter = "initial"
    UserPost.style.filter = "initial"
})


//CHAT ELEMENT IS DRAGGABLE

// dragElement(document.getElementById("mydiv"));

const dragElement = () => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}