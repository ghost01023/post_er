//SOME CONSTANTS REFERRING TO HTML ELEMENTS

// Feed.innerHTML = "Hello there";
const PostHeading = document.createElement("h1");
const LogOutForm = document.querySelector("form");
const PostButton = document.querySelector(".post-button");
const PostDiv = document.querySelector(".user-post");
const Feed = document.querySelector(".feed");
const PostDivForm = document.querySelector(".user-post form")
const PostNotPrivy = document.querySelector(".post-not-privy")

let shown_post_div = false
const Loading = document.querySelector(".loading")
// document.querySelector(".feed").innerHTML = "<div>Loading Posts...Please Wait...</div>"

PostButton.addEventListener("click", () => {
    if (shown_post_div) {
        PostDiv.style.visibility = "hidden";
        shown_post_div = false;
    } else {
        fetch("/privilege").then(res => res.json()).then(data => {
            console.log(data)
            if (data.privy === true) {
                PostDiv.style.visibility = "initial";
                shown_post_div = true;
            }
        })
    }
})

// PostDivForm.addEventListener("submit", (event) => {
//     event.preventDefault();
//     let formData = new FormData(PostDivForm);
//     formData.sub
// })

document.querySelector(".user-post form #post-file")
    .addEventListener("change", (event) => {
            console.log('logged file blob')
        }
    )

LogOutForm.addEventListener("submit", (event) => {
    event.preventDefault()
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
        // console.log(data);
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
    console.log(array)
    array.map(post => {
        const PostCard = document.createElement("div");
        PostCard.classList.add("post-card");
        console.log(post)
        console.log("Post Card Created")
        const PostHeading = document.createElement("h1");
        console.log("Post Heading created")
        PostHeading.innerText = post.caption;
        console.log("Inner Text of heading set")
        let PostImage = new Image()
        PostImage.src = "http://localhost:5000/users/" + post.username + post.link;

        // console.log("url is " + url);
        // "http://localhost:5000/users/" + post.username + "/posts" + post.link;
        PostCard.appendChild(PostImage);
        PostCard.appendChild(PostHeading);
        // console.log("PostHeading appended to PostCard");
        Feed.appendChild(PostCard);
        // console.log("PostCard added to feed");
    })
}