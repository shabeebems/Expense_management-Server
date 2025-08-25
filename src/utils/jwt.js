import jwt from 'jsonwebtoken'

export const deleteToken = async (res, token) => {
    res.clearCookie(token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    });
}

export const createAccessToken = (res, payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
        algorithm: 'HS256'
    });
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'none',
        path: '/'
    });
};

export const createRefreshToken = (res, payload) => {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '30d',
        algorithm: 'HS256'
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'none',
        path: '/'
    });
};

export const decodeToken = async (req, jwtSecret) => {
    const token = req.cookies?.accessToken;
    if(!token) return req.user
    return jwt.verify(token, jwtSecret);
}