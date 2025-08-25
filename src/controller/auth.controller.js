import userModel from "../models/user.model.js";
import { createAccessToken, createRefreshToken, deleteToken } from "../utils/jwt.js";

const loginCheck = async(req, res) => {
    try {
        const { email, password } = req.body
        const existingUser = await userModel.findOne({ email, password });
        
        if(!existingUser) return res.send({ success: false, message: "User not exist" })

        const payload = {
            _id: existingUser._id,
            email
        }

        createAccessToken(res, payload)
        createRefreshToken(res, payload);

        return res.send({ success: true, message: "Successs", token: { email } })
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async(req, res) => {
    try {
        deleteToken(res, "accessToken")
        deleteToken(res, "refreshToken")

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log(error.message)
    }
}

const register = async (req, res) => {
    try {
        const { email, username } = req.body;
        console.log(req.body)

        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.send({ success: false, message: "Email already exists" });
        }

        const existingUsername = await userModel.findOne({ username });
        if (existingUsername) {
            return res.send({ success: false, message: "Username already exists" });
        }

        const newUser = new userModel(req.body);
        await newUser.save();

        const payload = {
            _id: newUser._id,
            email: newUser.email,
        };

        createAccessToken(res, payload);
        createRefreshToken(res, payload);

        return res.send({ success: true, message: "Registration successful", token: { email } });
    } catch (error) {
        console.log(error.message);
        return res.send({ success: false, message: "Registration failed" });
    }
};


export default {
    loginCheck,
    logout,
    register
}
