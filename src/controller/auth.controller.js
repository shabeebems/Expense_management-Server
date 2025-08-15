import userModel from "../models/user.model.js";
import { createAccessToken, deleteToken } from "../utils/jwt.js";

const loginCheck = async(req, res) => {
    try {
        const { email, password } = req.body
        const existingUser = await userModel.findOne({ email, password });
        
        if(!existingUser) return res.send({ success: false, message: "User not exist" })

        const payload = {
            _id: existingUser._id,
            email
        }

        // Generate tokens and create tokens
        createAccessToken(res, payload)

        return res.send({ success: true, message: "Successs", token: { email } })
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async(req, res) => {
    try {
        deleteToken(res, "accessToken")

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log(error.message)
    }
}

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.send({ success: false, message: "User already exists" });
        }

        // Create new user
        const newUser = new userModel({ name, email, password });

        await newUser.save();

        const payload = {
            _id: newUser._id,
            email: newUser.email,
        };

        // Generate tokens and create tokens
        createAccessToken(res, payload);

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
