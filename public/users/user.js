const username = document.URL.substring((document.URL.lastIndexOf("/") + 1), (document.URL.length))


const UsernameDiv = document.querySelector(".user-name")
const UserBio = document.querySelector(".user-bio")
const UserFollowing = document.querySelector(".user-following")
const UserFollowers = document.querySelector(".user-followers")
const UserPosts = document.querySelector(".user-posts")
const UserImage = document.querySelector(".user-image")
const AllPosts = document.querySelector(".all-posts")
const FollowButton = document.querySelector(".follow-user-form button")

UsernameDiv.innerHTML = username


//FOLLOW USER

const FollowUserForm = document.querySelector(".follow-user-form");

FollowUserForm.addEventListener("submit", event => {
        event.preventDefault()
        const toFollow = UsernameDiv.innerHTML;
        const request = new XMLHttpRequest();
        const submit = new FormData()
        submit.append('user', toFollow)
        if (FollowButton.innerHTML === "Following") {
                console.log("Will unfollow from " + toFollow)
                request.open("POST", "/unfollow-user")
                request.send(submit)
        } else {
                request.open("POST", "/follow-user")
                request.send(submit)
                FollowButton.innerHTML = "Following"
        }
        console.log("Submitted form successfully!")
})


fetch("http://localhost:5000/user_details/" + username).then(res => res.json())
    .then(data => {
        const { bio, followers, following, total_posts, follow} = data;
        if (follow) {
                FollowButton.innerHTML = "Following";
        }
        UserBio.innerHTML = bio;
        UserFollowers.innerHTML = followers;
        UserFollowing.innerHTML = following;
        UserPosts.innerHTML = total_posts;
        UserImage.setAttribute("src", "http://localhost:5000/users/" + username + "/profile.jpg")
        console.log(data);
        fetch("http://localhost:5000/posts/" + username).then(data => {
                // console.log("Fetched nested posts as: ")
                // console.log(data.json())
                return data.json()
        }).then(postRes => {
                console.log(postRes)
                if (postRes["statusCode"] === 404) {
                        console.log("not found")
                        document.querySelector("body").innerHTML = "<h1 id='not-found'>404. User Could Not Be Found</h1>"
                }
                else {
                        postRes.map((post, index) => {
                                let card = document.createElement("div")
                                let image = document.createElement("img")
                                image.src = "http://localhost:5000/users/" + post.username + post.link;
                                card.appendChild(image)
                                card.id = "post" + (index + 1)
                                AllPosts.appendChild(card)
                        })
                }
        })
    })
