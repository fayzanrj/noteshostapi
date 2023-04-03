const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchUser = require('../middleware/fetchuser')

let JWT_Secret = "WebApp";

router.post('/createuser', [
    // validating the entered data
    body('name', "Enter a valid name").isLength({ min: 3 }),
    body('email', "Enter a valid email").isEmail(),
    body('password', "Password must be at least 5 characters long").isLength({ min: 5 }),
], async (req, res) => {
    // checking if any error exists in the added data 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        //checking if user already exists and acting accordingly
        let user = await User.findOne({ email: req.body.email.toLowerCase() })
        if (user) {
            return res.status(400).json({ error: "Sorry! A user with this email already exists" });
        }
        //creating hash of entered password and adding salt to it, then storing it in DATABASE and giving the user an AUTH TOKEN
        var salt = await bcrypt.genSalt(10);
        var secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: secPass,
        })
        const data = {
            user: {
                id: user.id
            }
        }
        var authToken = jwt.sign(data, JWT_Secret);

        res.json({ authToken })

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Some Error occured");
    }
})

router.post('/login', [
    // validating the entered data    
    body('email', "Enter a valid email").isEmail(),
    body('password', "Password cannot be empty").exists(),
], async (req, res) => {
    // checking if any error exists in the added data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        //checking if user exists and acting accordingly
        let user = await User.findOne({ email: req.body.email.toLowerCase() })
        if (!user) {
            return res.status(400).json({ error: "Entered e-mail and password does not match. Log in with correct credentials" });
        }
        //comparing the hash of entered password with the hash of password linked to the email provided and on TRUE giving the user an AUTH TOKEN
        const passwordCompare = bcrypt.compareSync(req.body.password, user.password)
        if (!passwordCompare) {
            return res.status(400).json({ error:"Entered e-mail and password does not match. Log in with correct credentials" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        var authToken = jwt.sign(data, JWT_Secret);

        res.json({ authToken })

    } catch (err) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


router.post('/getuser',fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password')
        res.send(user)
    } catch (err) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

module.exports = router