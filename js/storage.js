export class Storage {
    //sauvegarde du message
    static saveMessage(message) {
        const messages = this.loadMessages();
        //verifie si le message existe
        if (!messages.some(m => m.text === message.text && m.time === message.time)) {
            messages.push(message);
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }

    //chargement des messages depuis le localStorage
    static loadMessages() {
        const messages = localStorage.getItem('messages');
        return messages ? JSON.parse(messages) : [];
    }

}
