const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/client")
const passport = require("passport")
const Language = require("../models/language")

signToken = user => {
    return jwt.sign({
        iss: 'mttcsp-client-backend',
        sub: user.id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1)
    }, process.env.JWT_SECRET);
    
}

exports.createUser = (req, res) => {
        const user = new User({
            email: req.body.email,
            password: req.body.password
        });
        user.save().then(result => {
            res.status(201).json({
                message: 'User created.',
                result: result
            });
        }).catch(err => {
            console.log(err.message)
            res.status(500).json({
                    message: "Invalid authentication credentials!"
            });
        });
}

exports.userLogin = (req, res)=>{
    /* let fetchedUser;
    User.findOne({email: req.body.email}).then(user => {
        console.log(user);
        if(!user){
            return res.statusCode(401).json({
                message: 'Auth failed.'
            });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(result => {
        if(!result){
            return res.statusCode(401).json({
                message: 'Auth failed.'
            });
        }
        const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id}, 'secret', {expiresIn: '1h'});
        
        res.status(200).json({
            token: token,
            expiresIn: 3600,
            userId: fetchedUser._id
        });
    }).catch(err => {
        console.log(err)
        return res.status(401).json({
            message: 'Invalid authentication credentials!'
        });
    }); */
    const token = signToken(req.user);
    res.status(200).json({token})
}

exports.userProfile = (req, res) => {
    res.json({user: req.user})
}

exports.updateProfile = (req,res) => {
    const user = new User({
        _id: req.params.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        zip: req.body.zip,
        profilePic: req.body.profilePic
    })
    console.log(user)
    User.update({_id: req.params.id}, user).then(result => {
        console.log(result)
        if(result.n > 0){
            res.status(200).json({message:'Update successful'})
        } else {
            res.status(401).json({message: "Unauthorized"})
        }
    }).catch(error => {
        res.status(500).json({
            message: error.message
        })
    })
}

exports.userProfileGoogle = (req, res) => {
    console.log("Userscontroller.profile called")
    const token = signToken(req.user);
    res.status(200).json({token})
}