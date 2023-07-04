const {total_seconds, total_days, seconds_to_time} = require("./date_and_time")


const num_of_days = (val, isLeap) => {
    let arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (val === 2 && isLeap) {
        return 29
    } else {
        return arr[val]
    }
}
const posts = [
    {
        "id": "wa4n47g",
        "username": "a_new_man",
        "link": "/images/pWgdkPwMhBWkMJKuNUKlTPQHXBVNrVhbIWWOVjawdgJTAQKWaZ.png",
        "caption": "aah jast wan sam cukies fo' mysel'",
        "date": "2023-7-4",
        "time": [22, 22, 10]
    },
    {
        "id": "234189371914",
        "username": "august",
        "link": "/images/jZujHpwJHOHNTnxPiRjmAVThmbIDujgfBmesPjPuOwiPiLaSLB.png",
        "caption": "just browsing the shop today!",
        "date": "2023-7-4",
        "time": [20, 2, 45]
    },
    {
        "id": "slu3823",
        "username": "august",
        "link": "/images/KYrlXrPWcvDgctJSYZZQlYCVGqlCElpHBKZkTqTetcckRBQOLA.png",
        "caption": "usagi, my beloved",
        "date": "2023-7-4",
        "time": [20, 4, 4]
    },
    {
        "id": "2elo1tf",
        "username": "august",
        "link": "/images/gaQIjTHTvEoUwNBCXPObRUxPOrZBoARRmFYwOrDrTReDsnOGeL.png",
        "caption": "some more of that rabbit",
        "date": "2023-7-4",
        "time": [20, 4, 46]
    }
]

// let latest = posts.sort((first, second) =>
let post_time_link = []
posts.map(post => {
        post_time_link
            .push({
                id: post.id, age: parseFloat(`${total_days(post.date)}.${total_seconds(post.time)}`)
            })
    }
)

console.log(total_seconds([20, 4, 1]))
// )

post_time_link.sort((a, b) => a.age - b.age).map(post => {

})

console.log(post_time_link)


