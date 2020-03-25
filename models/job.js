const mongoose = require("mongoose");

const STATUS = ['CREATED', 'IN PROGRESS', 'DONE']

const jobSchema = mongoose.Schema({
  clientId: { type:String, required: true },
  folder: { type: String, required: true },
  sourceLang: { type: String, required: true },
  reqLang: { type: String, required: true },
  status: { type: String, enum: STATUS },
  employeeId: {type: String},
  creationDate: { type: String },
  startDate: { type: String },
  completionDate: { type: String }
});


module.exports = mongoose.model("Job", jobSchema);
