const mysql = require("mysql");
const database = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'people_data'
})

const FindUserNameFromEmail = (email) => {
    const find_query = `SELECT username FROM profile WHERE email = "${email}"`
    return new Promise((resolve) => {
        if (!email.includes("@")) {
            resolve(false)
        } else {
            database.query(find_query, (err, query_res) => {
                if (err) {
                    console.log("Couldn't call query for matching email with username.")
                } else {
                    resolve(query_res[0].username)
                }
            })
        }
    })
}

module.exports = { FindUserNameFromEmail }