import { BotManager } from './bot.js';
import { Storage } from './storage.js';

document.addEventListener("DOMContentLoaded", () => {
    const messageInput = document.getElementById('message');
    const sendBtn = document.getElementById('send-btn');
    const messageList = document.getElementById('message-list');

    const userImage = 'assets/bots/avatar.png'; 

    BotManager.init();
    loadMessages();

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            addMessage(createMessage('Me', message, 'user', time, userImage));
            BotManager.processMessage(message);
            messageInput.value = '';
        }
    }

    function createMessage(author, text, senderType, time, image) {
        return {
            author,
            text,
            senderType,
            time,
            image
        };
    }

    function addMessage(message) {
        const messageItem = document.createElement('div');
        messageItem.className = `message ${message.senderType === 'user' ? 'sent' : 'received'}`;
        messageItem.innerHTML = `
            <div class="avatar">
                <img src="${message.image}" alt="${message.author}" />
            </div>
            <div class="message-content">
                <div class="text">${message.text}</div>
                <div class="time">${message.time}</div>
            </div>
        `;
        messageList.appendChild(messageItem);
        messageList.scrollTop = messageList.scrollHeight;

        if (message.senderType === 'user') {
            Storage.saveMessage(message);
        }
    }

    function loadMessages() {
        const messages = Storage.loadMessages();
        messages.forEach(addMessage);
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});