const express = require("express");

const UserController = require("../controllers/user");

const passport = require("passport");
const passportConf = require("../configs/passport-config")
const checkAuth = require("../middleware/check-auth")

const router = express.Router();

router.use(passport.initialize())

router.post("/register", UserController.createUser);

router.post("/login", passport.authenticate('local', {session:false}), UserController.userLogin);

router.get("/profile", passport.authenticate('jwt', {session: false}), UserController.userProfile);

router.put("/profile/:id", passport.authenticate('jwt', {session: false}), UserController.updateProfile);

router.get("/googleprofile", (req,res)=>{
    res.redirect('/auth/google')
});
router.get("/auth/google", passport.authenticate('google', {scope: ['profile', 'email']}, {session: false}));

router.get("/auth/google/redirect", passport.authenticate('google', {session: false}), UserController.userProfileGoogle, (req, res) => {
    res.redirect('/');
});

module.exports = router;