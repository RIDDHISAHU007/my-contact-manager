const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please add all fields");
    }

    // Check if user exists     
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
        res.status(400);
        throw new Error("User already exists");
    }
    // Hash password
    const hashed0Password = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });
    console.log("User Created: ", user);
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
        });
    }
    else {
        res.status(400);
        throw new Error("User data is not valid");
    }
});
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.name,
                email: user.email,
                _id: user.id,}
            }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30d",
        });
        res.status(200).json({ accessToken });
    }
    else {
        res.status(401)
        throw new Error("Email or password is not valid");
    }
});
const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);

});
module.exports = { registerUser, loginUser, currentUser };