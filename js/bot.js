import { Storage } from './storage.js';

const createBot = (name, avatar, actions) => ({
    name,
    avatar,
    actions,
    respondToMessage: async (message) => {
        for (let action of actions) {
            if (message.includes(action.trigger)) {
                await action.execute(message);
                return true;
            }
        }
        return false;
    }
});

const BotManager = (() => {
    let bots = [];

    const init = () => {
        bots = [
            createBot('Blue Archive', 'assets/bots/bluearchive.png', [
                { trigger: 'blue archive info', execute: (message) => getBlueArchive(message) },
                { trigger: 'blue archive help', execute: () => ajoutMessage('Blue Archive', 'Tapez "blue archive info [nom du personnage]" pour avoir ses informations. (vous pouvez essayer avec Hoshino)', 'assets/bots/bluearchive.png') }
            ]),
            createBot('Pokemon', 'assets/bots/pokeball.png', [
                { trigger: 'pokemon sprite', execute: (message) => getPokemon(message) },
                { trigger: 'pokemon ditto', execute: () => getDitto() },
                { trigger: 'pokemon help', execute: () => ajoutMessage('Pokemon', 'Tapez "pokemon sprite [nom du pokemon]" pour afficher son sprite.', 'assets/bots/pokeball.png') }
            ]),
            createBot('Waifu', 'assets/bots/waifu.png', [
                { trigger: 'waifu touch', execute: () => getWaifuPoke() },
                { trigger: 'waifu dance', execute: () => getWaifuDance() },
                { trigger: 'waifu bully', execute: () => getWaifuBully() },
                { trigger: 'waifu help', execute: () => ajoutMessage('Pokemon', 'Tapez et choisissez parmi "waifu touch/dance/bully" pour afficher un gif.', 'assets/bots/waifu.png') }
            ])
        ];

        afficheBots();
        premierMessage();
    };

    const afficheBots = () => {
        const botsList = document.getElementById('bots').querySelector('ul');
        botsList.innerHTML = '';
        bots.forEach(bot => {
            const li = document.createElement('li');
            li.className = 'bot-item';
            li.dataset.botName = bot.name;
            li.innerHTML = `
                <div class="bot-avatar">
                    <img src="${bot.avatar}" alt="${bot.name}">
                </div>
                <div class="bot-info">
                    <span class="bot-name">${bot.name}</span>
                </div>
            `;
            botsList.appendChild(li);
        });
    };

    //affiche les infos d'une personnage
    const getBlueArchive = async (message) => {
        //verification de présence du parametre
        const personnage = message.split('blue archive info')[1]?.trim();
        if (!personnage) {
            ajoutMessage('Blue Archive', 'Pas de personnage !', 'assets/bots/bluearchive.png');
            return;
        }
        //recuperation des données a l'api
        const BlueArchiveResponse = await fetch(`https://api-blue-archive.vercel.app/api/characters?name=${personnage}`);
        const BlueArchiveData = await BlueArchiveResponse.json();
        //verification de présence de données
        if (!BlueArchiveData.data[0]) {
            ajoutMessage('Blue Archive', `Impossible de trouver le personnage "${personnage}".`, 'assets/bots/bluearchive.png');
            return;
        }
        //creation du message
        const BlueArchiveMessage = `${BlueArchiveData.data[0].name} est de type ${BlueArchiveData.data[0].damageType} et vient de ${BlueArchiveData.data[0].school}.`;
        ajoutMessage('Blue Archive', BlueArchiveMessage, 'assets/bots/bluearchive.png');
    };

    //affiche un sprite de pokemon
    const getPokemon = async (message) => {
        const pokemon = message.split('pokemon sprite')[1]?.trim();
        if (!pokemon) {
            ajoutMessage('Pokemon', 'Pas de pokemon !', 'assets/bots/pokeball.png');
            return;
        }
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        const pokemonData = await pokemonResponse.json();
        if (!pokemonData) {
            ajoutMessage('Pokemon', `Impossible de trouver le pokemon "${pokemon}".`, 'assets/bots/pokeball.png');
            return;
        }
        const spriteMessage = `
        <div>
            <p>${pokemonData.species.name}</p>
            <img src="${pokemonData.sprites.front_default}"/>
        </div>
        `;
        ajoutMessage('Pokemon', spriteMessage, 'assets/bots/pokeball.png');
    };

    //?
    const getDitto = async () => {
        const cursedMessage = `
            <div>
                <img src="assets/cursed/ditto.png"/>
            </div>
        `;
        ajoutMessage('Pokemon', cursedMessage, 'assets/bots/pokeball.png');
    }

    //appel api pour un gif de la category poke
    const getWaifuPoke = async () => {
        const waifuResponse = await fetch(`https://api.waifu.pics/sfw/poke`);
        const waifuData = await waifuResponse.json();
        affichageWaifu(waifuData);
    };

    //appel api pour un gif de la category dance
    const getWaifuDance = async () => {
        const waifuResponse = await fetch(`https://api.waifu.pics/sfw/dance`);
        const waifuData = await waifuResponse.json();
        affichageWaifu(waifuData);
    };

    //appel api pour un gif de la category bully
    const getWaifuBully = async () => {
        const waifuResponse = await fetch(`https://api.waifu.pics/sfw/bully`);
        const waifuData = await waifuResponse.json();
        affichageWaifu(waifuData);
    };

    //optimisation du code réutilisable
    const affichageWaifu = (Data) => {
        if (!Data) {
            ajoutMessage('Waifu', `Ressayez plus tard.`, 'assets/bots/waifu.png');
            return;
        }
        const waifuMessage = `
        <div>
            <img src="${Data.url}"/>
        </div>
        `;
        ajoutMessage('Waifu', waifuMessage, 'assets/bots/waifu.png');
    }

    //créer le template du message
    const ajoutMessage = (botName, text, image) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageItem = document.createElement('div');
        messageItem.className = `message received`;
        messageItem.innerHTML = `
            <div class="avatar">
                <img src="${image}" alt="${botName}" />
            </div>
            <div class="message-content">
                <div class="text">${text}</div>
                <div class="time">${time}</div>
            </div>
        `;
        const messageList = document.getElementById('message-list');
        messageList.appendChild(messageItem);
        messageList.scrollTop = messageList.scrollHeight;

        Storage.saveMessage({ author: botName, text, senderType: 'bot', time, image });
    };

    const processMessage = async (message) => {
        for (let bot of bots) {
            if (await bot.respondToMessage(message)) {
                return;
            }
        }
    };

    const premierMessage = () => {
        const messages = Storage.loadMessages();
        if (messages.length === 0) {
            const firstMessage = `
                Trois bots sont à disposition, entrez leur nom suivi de help pour plus d'information.
            `;
    
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const image = 'assets/bots/avatar.png';
            Storage.saveMessage({ author: 'System', text: firstMessage, senderType: 'bot', time, image });
        }
    };
    

    return {
        init,
        processMessage
    };
})();

export { BotManager };
