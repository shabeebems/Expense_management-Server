import jwt from 'jsonwebtoken'

export const deleteToken = async (res ,token) => {
    res.clearCookie(token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/'
    });
}

export const createAccessToken = (res, payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30m',
        algorithm: 'HS256'
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 60 * 1000, // 30 minutes
        sameSite: 'none',
        path: '/'
    });
};

export const createRefreshToken = (res, payload) => {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '10d',
        algorithm: 'HS256'
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        sameSite: 'none',
        path: '/'
    });
};

export const decode = async (token, jwtSecret) => {
    return jwt.verify(token, jwtSecret);
}