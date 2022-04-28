const {Schema, model} = require('mongoose');

const user = new Schema({
    userID: {
        required: true,
        type: String,
    },
    username: {
        required: true,
        type: String,
    },
    first_name: {
        required: true,
        type: String,
    },
    lastActiveDate: {
        default: new Date(),
        type: String,
        required: true
    }
});

module.exports = model('users', user)
