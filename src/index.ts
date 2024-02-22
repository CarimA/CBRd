import dotenv from 'dotenv';
import { Client, Room, User, RoomMessage, PrivateMessage } from 'ts-psim-client';
import Express from 'express';
import * as path from 'path';

// assign types to expected env vars
declare let process: {
	env: {
		PORT: number;
		PSIM_USERNAME: string;
		PSIM_PASSWORD: string;
		PSIM_AVATAR: string;
		PSIM_AUTO_JOIN_ROOMS: string;
		PSIM_TOUR_ROOM: string;
		DISCORD_TOKEN: string;
		DISCORD_SERVER_ID: string;
		DISCORD_ANNOUNCE_CHANNEL: string;
		DISCORD_TOURS_CHANNEL: string;
		SHEET_ID: string;
		GOOGLE_SECRETS: string;
	};
};
dotenv.config();

// heroku requires that apps serve a web page to stay up
const express = Express();
const fileOptions = {
	root: path.join(__dirname)
};

express.use('/', (req, res) => res.send('go away'));
express.use('/roomintro.gif', (req, res) => res.sendFile('../roomintro.gif', fileOptions, function (err) {
        if (err) {
            console.error('Error sending file:', err);
        }
    }));
express.listen(process.env['PORT'] || 3000);

import psimClient from './state/psimClient';
import discordClient from './state/discordClient';

const psim = psimClient();
const discord = discordClient();

// load modules
import TournamentsModule from './modules/tournaments';
import AnnouncementInteropModule from './modules/announcementInteropModule';
import RoleAssignmentModule from './modules/RoleAssignmentModule';
import modules from './state/modules';
import subscribe from './state/subscribe';
import populateData from './state/populateData';

const tours = new TournamentsModule(psim, discord);
modules.push(new AnnouncementInteropModule(psim, discord));
modules.push(tours);
modules.push(new RoleAssignmentModule(discord));

subscribe();
populateData();

psim.onReady.subscribe((client: Client) => {
	client.login(process.env['PSIM_USERNAME'], process.env['PSIM_PASSWORD'], true);
});

psim.onLogin.subscribe(async (client: Client) => {
	const rooms: string[] = process.env['PSIM_AUTO_JOIN_ROOMS'].split(',').map((room) => room.trim());
	await client.join(...rooms);
	await client.setAvatar(process.env['PSIM_AVATAR']);
});

psim.onRoomJoin.subscribe(async (client: Client, room: Room) => {
	modules.forEach(async (module) => {
		if (module.onRoomJoin) {
			await module.onRoomJoin(client, room);
		}
	});

	room.onMessage.subscribe(async (room: Room, message: RoomMessage) => {
		modules.forEach(async (module) => {
			if (module.onRoomMessage) {
				await module.onRoomMessage(client, room, message);
			}
		});
		
		if (!message.isIntro && message.user.username === 'cheir' && message.text.trim().includes('simulate start vote')) {
			tours.startVote(15)();
		}
		if (!message.isIntro && message.user.username === 'cheir' && message.text.trim().includes('simulate stop vote')) {
			tours.stopVote()();
		}
		if (!message.isIntro && message.user.username === 'cheir' && message.text.trim().includes('simulate tour start')) {
			tours.runTournament()();
		}
	});
});

psim.onPrivateMessage.subscribe(async (user: User, message: PrivateMessage) => {
	modules.forEach(async (module) => {
		if (module.onPrivateMessage) {
			await module.onPrivateMessage(user, message);
		}
	});
});

discord.on('ready', () => {
	console.log(`Logged into Discord as ${discord.user?.tag}`);
});

discord.on('message', (message) => {
	modules.forEach(async (module) => {
		if (module.onDiscordMessage) {
			await module.onDiscordMessage(message);
		}
	});
});
