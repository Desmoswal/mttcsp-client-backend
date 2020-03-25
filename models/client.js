const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");

const clientSchema = mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  zip: { type: Number },
  googleId: { type: String },
  profilePic: { type: String, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' },
  folder: { type: String }
});

clientSchema.pre("save", async function(next) {
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

clientSchema.methods.isPasswordValid = async function(inputPassword) {
  try {
    console.log(await bcrypt.compare(inputPassword, this.password));
    return await bcrypt.compare(inputPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

clientSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Client", clientSchema);
