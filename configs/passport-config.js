const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { ExtractJwt } = require("passport-jwt");
const User = require("../models/employee");
//const User = require("../models/client");
const dotenv = require("dotenv").config();

passport.use('local', new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email})

        if(!user){
            done(null, false);
        }

        const isValid = await user.isPasswordValid(password);
        if(!isValid){
            return done(null,false);
        }

        done(null, user);
    } catch (error) {
        done(error, false)
    }
}));

passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
    console.log('jwt')
    try {
        const user = await User.findById(payload.sub);
        if(!user){
            console.log("no user found")
            return done(null,false);
        }
        console.log(user)
        done(null, user);
    } catch (error) {
        done(error,false)
    }
}));

passport.use('google', new GoogleStrategy({
    //options
    callbackURL:'/auth/google/redirect',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
},(accessToken, refreshToken, profile, done)=>{
    //passport callback
    console.log(profile.name.familyName)

    User.findOne({googleId: profile.id}).then((currentUser)=>{
        if(currentUser){
            console.log(currentUser)
            done(null, currentUser);
        } else {
            console.log("Saving new user from Google")
            new User({
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                googleId: profile.id,
                profilePic: profile.photos[0].value
            }).save().then((newUser)=>{
                console.log("NEW USER: " + newUser)
                done(null, newUser);
            })
        }
    });
}));