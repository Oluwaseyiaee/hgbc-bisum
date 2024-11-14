const mongoose = require("mongoose");
const validator = require("validator");

const photizoSchema = new mongoose.Schema({
    lastName: {
    type: String,
    required: [true, "Please enter your last name."]
  },
  firstName: {
    type: String,
    required: [true, "Please enter your first name."]
  },
  gender:{
    type: String,
    required: [true, "Please select a gender in the option."]
  },
  age:{
    type: String,
    required: [true, "Please select your age range."]
  },
  mobileNumber: {
    type: String,
    required: [true, "Please enter your mobile number."],
    maxLength: 15,
    minLength: 11
  },
  city: {
    type: String,
    required: [true, "Please enter your city name."]
  },
  state:{
    type: String,
    required: [true, "Please enter your state name."]
  },
  occupation:{
    type: String,
    required: [true, "Please enter your occupation."]
  },
  attendance:{
    type: String,
    required: [true, "Please enter where you are joining us from."]
  },
  learnings:{
    type: String,
    required: [true, "Please enter how you heard about the program."]
  },
  otherLearnings:{
    type: String
  },
  photo: {
    type: String,
    required: [true, "Please upload your payment receipt."]
  },
  email: {
    type: String,
    required: [true, "Please enter your email address."],
    unique: [true, "A user with this email exists."],
    validate: [validator.isEmail, "Invalid email address."]
  },
  serialNo:{
   type: Number,
   unique: true
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

photizoSchema.pre("save",async function(next){
  if(this.serialNo){
    next();
  }else{
  const count = await Photizo.countDocuments({}); // Empty query to count all documents
  this.serialNo=(count + 1);
  next();
  }
})

photizoSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});


const Photizo = mongoose.model('Photizo', photizoSchema);

module.exports = Photizo;
