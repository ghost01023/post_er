const gen_image_name = () => {
    const arr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-_";
    let name = ""
    for (let i = 0; i < 50; i++) {
        name += arr[Math.floor(Math.random() * 50)]
    }
    return name + ".png";
}

module.exports = { gen_image_name }