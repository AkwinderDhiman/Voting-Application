const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user'); // Assuming you have a User model
const { jwtAuthMiddleware, generateToken } = require('../jwt');

// Define your user-related routes here
router.get('/', (req, res) => {
  res.send('Candidate endpoint');
});

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user && user.role === "admin";
  } catch (err) {
    return false;
  }
}

// Add candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    const data = req.body; // assuming the request body contains the candidate data

    // Create a new user document using mongoose model
    const newCandidate = new Candidate(data);

    // Save the new user to the database
    const response = await newCandidate.save();
    console.log('data saved')
    res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update candidate
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    const candidateId = req.params.candidateID; // Extract the id from the URL parameter

    const updatedCandidateData = req.body; // Updated data for the candidate

    const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
      new: true,
      runValidators: true
    });
    if (!response) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }
    console.log('Candidate Updated')
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    const candidateID = req.params.candidateID; // Extract the id from the URL parameter

    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }
    console.log('Candidate Deleted')
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// let's start voting
router.get('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
  // no admin can vote
  // user can only vote once

  candidateID = req.params.candidateID;
  userId = req.user.id;

  try{
      // Find the Candidate document with the specified candidateID
      const candidate = await Candidate.findById(candidateID);
      if(!candidate){
          return res.status(404).json({ message: 'Candidate not found' });
      }

      const user = await User.findById(userId);
      if(!user){
          return res.status(404).json({ message: 'user not found' });
      }
      if(user.role == 'admin'){
          return res.status(403).json({ message: 'admin is not allowed'});
      }
      if(user.isVoted){
          return res.status(400).json({ message: 'You have already voted' });
      }

      // Update the Candidate document to record the vote
      candidate.votes.push({user: userId})
      candidate.voteCount++;
      await candidate.save();

      // update the user document
      user.isVoted = true
      await user.save();

      return res.status(200).json({ message: 'Vote recorded successfully' });
  }catch(err){
      console.log(err);
      return res.status(500).json({error: 'Internal Server Error'});
  }
});


// vote count 
router.get('/vote/count', async (req, res) => {
  try{
      // Find all candidates and sort them by voteCount in descending order
      const candidate = await Candidate.find().sort({voteCount: 'desc'});

      // Map the candidates to only return their name and voteCount
      const voteRecord = candidate.map((data)=>{
          return {
              party: data.party,
              count: data.voteCount
          }
      });

      return res.status(200).json(voteRecord);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
});


// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
  try {
      // Find all candidates and select only the name and party fields, excluding _id
      const candidates = await Candidate.find({}, 'name party -_id');

      // Return the list of candidates
      res.status(200).json(candidates);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
