import jwt from "jsonwebtoken";
import { createAccessToken, createRefreshToken, deleteToken } from "../utils/jwt.js";

export const authenticateToken = async(req, res, next) => {
    const accessToken = req.cookies.accessToken
    const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env
    if(accessToken) {
        jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err) {
                deleteToken(res, 'accessToken')
                deleteToken(res, 'refreshToken')
            } else {
                next()
            }
        })
    } else {
        const refreshToken = req.cookies.refreshToken
        if(refreshToken) {
            jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
                if(err) {
                    deleteToken(res, 'accessToken')
                    deleteToken(res, 'refreshToken')
                } else {
                    const { iat, exp, ...payload } = decoded
                    createAccessToken(res, payload)
                    next()
                }
            })
        } else {
            console.log('No tokens')
        }
    }
}

