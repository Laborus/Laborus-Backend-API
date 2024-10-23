// const jwt = require("jsonwebtoken");

// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
// const JWT_TIMEOUT_DURATION = process.env.JWT_TIMEOUT_DURATION;
// const JWT_REFRESH_TIMEOUT = process.env.JWT_REFRESH_TIMEOUT;

// exports.generateTokens = (user) => {
//   const accessTokenPayload = {
//     id: user._id,
//     email: user.email,
//     accountType: user.accountType,
//   };

//   const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
//     expiresIn: JWT_TIMEOUT_DURATION,
//   });

//   const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
//     expiresIn: JWT_REFRESH_TIMEOUT,
//   });

//   return { accessToken, refreshToken };
// };

// exports.verifyAccessToken = (req, res, next) => {
//   const token =
//     req.headers.authorization && req.headers.authorization.split(" ")[1];

//   if (!token) {
//     return errorResponse(res, "ACCESS_DENIED", "No token provided.");
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return errorResponse(res, "INVALID_TOKEN", "Invalid or expired token.");
//   }
// };

// exports.verifyRefreshToken = (token) => {
//   try {
//     return jwt.verify(token, JWT_REFRESH_SECRET);
//   } catch (error) {
//     return null;
//   }
// };
