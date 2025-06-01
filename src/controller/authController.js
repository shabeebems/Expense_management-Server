import userModel from "../models/userModel.js";
import { createAccessToken, createRefreshToken, deleteToken } from "../utils/jwt.js";

const loginCheck = async(req, res) => {
    try {
        const { email, role } = req.body
        const existingUser = await userModel.findOne({ email, password: req.body.password });
        
        if(!existingUser) return res.send({ success: false, message: "User not exist" })
        if(existingUser.role !== role) return res.send({ success: false, message: `You're not ${role}` })

        const payload = {
            _id: existingUser._id,
            companyCode: existingUser.companyCode,
            email, role
        }

        // Generate tokens and create tokens
        await createAccessToken(res, payload)
        await createRefreshToken(res, payload)

        return res.send({ success: true, message: "Success" })
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async(req, res) => {
    try {
        deleteToken(res, "refreshToken")
        deleteToken(res, "accessToken")
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log(error.message)
    }
}

export default {
    loginCheck,
    logout
}
