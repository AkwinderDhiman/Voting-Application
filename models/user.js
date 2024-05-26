const mongoose = require('mongoose');
// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
    },
    email: {
        type: String,
        unique: true,
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: ['voter']
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});


userSchema.pre('save', async function (next) {
    const person = this;

    //Hash the password only if it has been modified (or is new)
    if (!person.isModified('password')) return next();
    try {
        //Hash password genertion
        const salt = await bcrypt.genSalt(10);

        //Hash password
        const hashedPassword = await bcrypt.hash(person.password, salt);

        //Override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    } catch (err) {
        return next(err)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        //use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}
// Create the User model from the schema
const User = mongoose.model('User', userSchema);
module.exports = User;
