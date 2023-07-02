//SOME CONSTANTS REFERRING TO HTML ELEMENTS

// Feed.innerHTML = "Hello there";
const PostHeading = document.createElement("h1");
const LogOutBtn = document.querySelector(".log-out")

LogOutBtn.addEventListener("click", () => {
    let sure = prompt("Do you really want to log out?")
    if (sure) {
        fetch("/", {

        })
    }
})
//FUNCTION RUNS FOR FIRST TIME WHEN LOADING FEED PAGE,

//RUNS AND RE-RUNS EACH TIME THE USER SCROLLS TO THE
//END OF HIS FEED, UNTIL (OF COURSE) HE REACHES THE
//END OF ALL OF HIS FEED
const LoadPosts = () => {
    fetch("/feed-posts").then(res => {
            console.log('The data is ' + res);
            // ConstructPage(data)
        }
    )
}
LoadPosts()

//FUNCTION TO PARSE RECEIVED JSON OF POST DATA

//AND CONSTRUCT PAGE LAYOUT BY ADDING POST ITEMS
//AND SETTING THEIR ATTRIBUTES AND IMAGE
//LINKS
const ConstructPage = (array) => {
    const Feed = document.querySelector(".feed");
    array.map(url => {
        const PostCard = document.createElement("div");
        PostCard.classList.add("post-card");
        // console.log("Post Card Created")
        // const PostHeading = document.createElement("h1");
        // console.log("Post Heading created")
        // let h1 = card.post;
        // console.log("Post value is " + h1);
        // PostHeading.innerText = h1.toString();
        // console.log("Inner Text of heading set")
        const PostImage = document.createElement("img");
        // console.log("url is " + url);
        PostImage.src = url;
        PostCard.appendChild(PostImage);
        // console.log("PostHeading appended to PostCard");
        Feed.appendChild(PostCard);
        // console.log("PostCard added to feed");
    })
}