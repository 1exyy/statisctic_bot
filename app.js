const TelegramApi = require('node-telegram-bot-api');
const config = require('./config/config');
const mongoose = require('mongoose');
const Chat = require('./models/Chat')
const User = require('./models/Users')

const regExp = {
    'command': new RegExp('/[aA-zZ]'),
    'link': new RegExp('http[s]://'),
};

const bot = new TelegramApi(config.bot.token, {
    polling: true
});

async function start() {
    try {
        await mongoose.connect(config.DB.URI);

        bot.on('message', async (msg) => {
            let user;
            let chat;
            //database constants
            const objectAllChats = createObjectAllChats(await Chat.find({}));
            const objectAllUsers = createObjectAllUsers(await User.find({}));

            //telegram constants
            const text = msg.text;
            const chatID = msg.chat.id;
            const userID = msg.from.id;
            const isBot = msg.from.is_bot;
            const messageID = msg.message_id;
            const first_name = msg.from.first_name;
            const language = msg.from.language_code;
            const username = msg.from.username ? '@' + msg.from.username : '-';


            //logic
            if (!(userID in objectAllUsers)) {
                user = new User({
                    userID,
                    username,
                    first_name
                });

                await user.save();
            } else {
                user = await User.findOne({userID});
                user.lastActiveDate = new Date();
                user.save();
            }

            if (!(chatID in objectAllChats)) {
                chat = new Chat({
                    chatID,
                    users: [user._id]
                });

                chat.save();
            } else {
                chat = await Chat.findOne({chatID});

                if (chat.users.indexOf(user._id) == -1) {
                    chat.users.push(user._id);
                    chat.save();
                }

            }

            if (regExp.command.test(text)) {
                let [command, ...params] = text.split(' ');

                switch (command) {
                    case '/help':
                        break;
                    case '/anon':
                        await bot.deleteMessage(chatID, messageID);
                        await bot.sendMessage(chatID, params.join(' '));
                        break;
                    case '/all':
                        let string = '\n'
                        let users = chat.users;

                        for (const e of users) {
                            let currentUser = await User.findById(e);
                            string += currentUser.username + '\n'
                        }

                        await bot.deleteMessage(chatID, messageID);
                        await bot.sendMessage(chatID, params.length ? params.join(' ') + string : '' + string);
                        break;
                    default:
                        await bot.sendMessage(chatID, "Я переезжаю на node.js. Команды временно не работают");
                        return;
                }
            }
        });
    } catch (e) {

    }
}

start().then(r => {
    console.log("Бот стартовал успешно");
});

function removePunctuation(string) {
    return string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
}

function createObjectAllChats(array) {
    let obj = {}

    array.forEach(e => {
        obj[e.chatID] = {...e}
    });

    return obj;
}

function createObjectAllUsers(array) {
    let obj = {}

    array.forEach(e => {
        obj[e.userID] = {...e}
    });

    return obj;
}

function toStringFormatDate(date) {
    let Day = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    let Month = ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1));
    let Year = (date.getFullYear() < 10 ? '0' + date.getFullYear() : date.getFullYear());

    return Day + "." + Month + "." + Year;
}
