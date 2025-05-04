// //defining schema (backend validation)
// const mongoose = require('mongoose')
// const passportLocalMongoose = require('passport-local-mongoose');
// const signupSchema = new mongoose.Schema({
//     firstName:{
//         type: String,
//         trim:true,
//         required: true,
//     },
//     lastName:{
//         type: String,
//         trim:true,
//         required: true,
//     },
//      role:{
//         type: String,
//         trim:true,
//         required: true, 
//         enum:['salesAgent', 'director', 'manager'], //soecifies that this feild should only have these three values.
//         default: ['salesAgent'] // if nothing is entered, they will default to salesAgent.
//      },
//      email:{
//         type: String,
//     trim:true,
//     required: true,
//     unique: true,
//      },
//      createdAt : {
//         type : Date,
//         immutable: true, //cannot be modified after creation
//         default: Date.now
//      }  
// });
// signupSchema.plugin(passportLocalMongoose,{
//     usernameField : 'email',
//     errorMessages:{
//         userExistsError: 'This user already exists'
//     }
//  });

//  //role checking
//  signupSchema.statics.isRole = async function(email,role){
//     const user = await this.findOne({email}).select('role');
//     return user?.role === role;
//  }
// //  /**
// //  * Checks if a user has a specific role
// //  * @param {string} email - User's email
// //  * @param {string} role - Role to check against
// //  * @returns {Promise<boolean>} - True if user has the role
// //  */
//module.exports = mongoose.model('resetPassword', resetPassword);
