const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[0];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    req.userData = {userId: decodedToken.sub};
    next();
  } catch (error) {
    res.status(401).json({
      message: "Authentication failed from check-auth"
    });
  }
};
