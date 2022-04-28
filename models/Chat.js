const {Schema, model} = require('mongoose');

const chat = new Schema({
    chatID: {
        type: String,
        required: true
    },
    users: [{
        ref: 'users',
        type: Schema.Types.ObjectId
    }]
});

module.exports = model('chats', chat)
