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
    fetch("/rem-sesh").then(res => res.json()).then(logoutStatus => {
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
        let nameLabel = document.createElement("h6")
        nameLabel.innerHTML = user.username
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
const CloseChatList = document.querySelector(".close-chat-list")
const FeedPage = document.querySelector(".feed-page")
const UserPost = document.querySelector(".user-post")
ChatBtn.addEventListener("click", () => {
    ChatScreen.style.visibility = "initial";
    FeedPage.style.filter = "blur(3px) brightness(0.7)"
    UserPost.style.filter = "blur(3px) brightness(0.7)"
})

CloseChatList.addEventListener("click", () => {
    ChatScreen.style.visibility = "hidden";
    FeedPage.style.filter = "initial"
    UserPost.style.filter = "initial"
})