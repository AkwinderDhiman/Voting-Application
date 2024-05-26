const mongoose = require('mongoose');
// Define the Candidate schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    party: {
        type: String,
        unique: true,
    },
    age: {
        type: Number,
    },
    votes: [
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            votedAt:{
                type:Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
});
// Create the Candidate model from the schema
const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
