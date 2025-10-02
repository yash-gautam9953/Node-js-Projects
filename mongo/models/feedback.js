const mongoose = require("mongoose");

const feedbackSchema =  new mongoose.Schema({
    feedback :{
        type : String,
        maxLength : 200
    },
});

const feedbacks = mongoose.model("ChatsAppfeedback" , feedbackSchema);

module.exports = feedbacks;