const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");

const employeeSchema = mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  zip: { type: Number },
  languages: { type: Array },
  profilePic: { type: String, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' },
  role: { type: String }
});

employeeSchema.pre("save", async function(next) {
  try {
    if(!this.googleId)
    {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});


employeeSchema.methods.isPasswordValid = async function(inputPassword) {
  try {
    console.log(await bcrypt.compare(inputPassword, this.password));
    return await bcrypt.compare(inputPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

employeeSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Employee", employeeSchema);
