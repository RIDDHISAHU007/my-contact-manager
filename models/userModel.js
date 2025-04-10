const mongoose = require('mongoose');
const userSchema =new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add your name"]
    },
    email: {
        type: String,
        required: [true, "Please add your email address"],
        unique: [true, "Email already exists"],
    },
    password: {
        type: String,
        required: [true, "Please add a password"]
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("User", userSchema);