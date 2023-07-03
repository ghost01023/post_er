const multer = require("multer")

let k = 12

const getk = () => {
    k++;
    return k
}

const storageEngine = multer.diskStorage({
    destination: "../database/users/sample-post-images/",
    filename: "sample_image" + getk() + ".png",
})

const upload = multer({
    storage: storageEngine,
    filename: "sample_image.png"
}).single("post-file")