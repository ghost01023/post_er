const title = document.querySelector("head title")
let onLogin = false
const login = document.querySelector(".login label")
const signup = document.querySelector(".signup label")
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey) {
        if (event.key === "ArrowUp") {
            login.click();
        } else if (event.key === "ArrowDown") {
            signup.click();
        }
    }
})
login.addEventListener("click", () => {
    if (!onLogin) {
        onLogin = true;
        title.innerHTML = "Log-In"
    }
});
signup.addEventListener("click", () => {
    if (onLogin) {
        onLogin = false;
        title.innerHTML = "Sign-Up"
    }
})

let form = document.querySelector(".login form");
form.addEventListener("submit", (e) => {
        e.preventDefault()
        loginFunc().then(res => {
                if (res) {
                    const button = document.querySelector(".login button")
                    button.style.background = 'blue';
                    button.innerHTML = 'Profile Not Found';
                }
            }
        ).then((res) => console.log(res)).then(() => form.submit())
    }
)

const loginFunc = async () => {
    return new Promise((resolve, reject) => {
        try {
            fetch("http://localhost:5000/authenticate", {
                method: 'POST',
                body: new FormData(form),
            }).then(res => {
                resolve(true)
                console.log(res.text())
            })
        } catch (err) {
            reject(true)
            console.log("Error while submitting form!")
        }
    })
}

// document.querySelector(".login form").addEventListener("submit", () => {
//     console.log("doing...")

// const seltzer = await
// })