const mongoose = require("mongoose");
const passportLocalMongoose= require('passport-local-mongoose');

const signupSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    trim: true,
    required: true,
    //enum: ["salesAgent", "manager", "director"],
    //default: "salesAgent"
  },
  });
signupSchema.plugin(passportLocalMongoose,{
    usernameField:'email',
});
//delete mongoose.connection.models['Signup'];
module.exports = mongoose.model('signup', signupSchema);
