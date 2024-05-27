const express = require('express');
const router = express.Router()
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt')

// Define your user-related routes here
router.get('/', (req, res) => {
    res.send('User endpoint');
});


//post route to add a user
router.post('/signup', async (req, res) => {
  try {
    const data = req.body;
    const newUser = new User(data); //craete a new User document using Mongoose model
    const response = await newUser.save();// Save the new User to the database

    const payload = {
      id: response.id
    }

    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log('Token', token)

    res.status(200).json({ response: response, token: token });

  }
  catch (error) {
    console.log(error)
  }
});


//Login route
router.post('/login', async (req, res) => {
  try {
    //Extract username and password from request body
    const { aadharCardNumber, password } = req.body;

    //find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    // if user does not exist and password not match , return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    //generate token 
    const payload = {
      id: user.id
    }

    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log('Token', token)

    res.status(200).json({ response: response, token: token });

  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Profile route
router.post('/profile',jwtAuthMiddleware,  async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//update user
router.put('/profile/password',jwtAuthMiddleware,  async (req, res) => {
  try {
    const userId = req.user;// Extract the id fromm the token

    //Extract cuurent and new password from request body
    const {currentPassword, newPassword} = req.body;

     //find the user by Id
    const user = await User.findById(userId);

     // if  password not match , return error
     if ( !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    //update the user password
    user.password = newPassword;
    await user.save();
    console.log('Password Updated')
    res.status(200).json({message:'Password Updated'});
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// app.get('/', (req, res) => {
//   res.send('hello world')
// })

module.exports = router;