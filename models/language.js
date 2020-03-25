const mongoose = require("mongoose");

const languageSchema = mongoose.Schema({
    name: {type: String, required: true},
    short: {type: String, required: true}
});

module.exports = mongoose.model("Language", languageSchema);
