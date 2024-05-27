const express = require('express');
const router = express.Router()
const Candidate = require('../models/candidate');
const { jwtAuthMiddleware, generateToken } = require('../jwt')

// Define your user-related routes here
router.get('/', (req, res) => {
  res.send('Candidate endpoint');
});

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    console.log(user.role,'user.role');
    return user.role === "admin";
  } catch (err) {
    return false
  }
}

//add candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (! await checkAdminRole(req.user.id))
      return res.status(404).json({ message: "User does not have admin role" })

    const data = req.body; // assuming the request body contains the candidate data

    //create  a new user document using mongoose model
    const newCandidate = new Candidate(data);

    //save the new user to the database
    const response = await newCandidate.save();
    console.log('data saved')
    res.status(200).json({ response: response });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//update candidate
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (checkAdminRole(req.user.id))
      return res.status(404).json({ message: "User does not have admin role" });

    const candidateId = req.params.candidateID;// Extract the id fromm the URL parameter

    const updatedCandidateData = req.body; //updated data for the candidate

    const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
      new: true,
      runValidators: true
    });
    if (!response) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }
    console.log('Candidate Updated')
    res.status(200).json(response);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//update candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (checkAdminRole(req.user.id))
      return res.status(403).json({ message: "User does not have admin role" });

    const candidateID = req.params.candidateID;// Extract the id fromm the URL parameter

    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }
    console.log('Candidate Deleted')
    res.status(200).json(response);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;