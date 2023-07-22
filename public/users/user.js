const username = "commie"

const UsernameDiv = document.querySelector(".user-name")

UsernameDiv.innerHTML = username

// fetch("http://localhost:5000/user_details/" + username).then(res => {
//     console.log("gotten back this...")
//     console.log(res)
// })