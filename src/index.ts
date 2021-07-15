import dotenv from 'dotenv';
import { Client, Room, User, RoomMessage, PrivateMessage } from 'ts-psim-client';
import Express from 'express';
import * as Discord from 'discord.js';

import { populate, onPopulate, AutoNotificationModel } from './database/autoNotifications';

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
express.use('/', (req, res) => res.send('go away'));
express.listen(process.env['PORT'] || 3000);

const psimClient = new Client({ debug: true });
const discordClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });

// load modules
import Module from './module';
import DebugModule from './modules/debug';
import TournamentsModule from './modules/tournaments';
import AnnouncementInteropModule from './modules/announcementInterop';
import GitModule from './modules/git';
import RoleAssignmentModule from './modules/RoleAssignmentModule';
import AutoNotificationModule from './modules/autoNotificationModule';

const tours = new TournamentsModule(psimClient, discordClient);

let modules: Module[] = [
	new DebugModule(),
	new AnnouncementInteropModule(psimClient, discordClient),
	new GitModule(),
	tours,
	new RoleAssignmentModule(discordClient)
];

function removeModules<T extends Module>(typeT: new (...params: any[]) => T) {
	const beforeCount = modules.length;
	modules = modules.filter((module) => !(module instanceof typeT));
	const afterCount = modules.length;

	return [
		null,
		{
			count: beforeCount - afterCount
		}
	];
}

onPopulate.subscribe(([err, data]) => {
	if (err) {
		console.error(err);
	} else {
		console.log(data);

		const [err, results] = removeModules(AutoNotificationModule);
		if (!results) {
			console.error('Could not deregister modules');
			console.error(err);
		} else {
			console.log(`Removed ${results.count} module(s)`);
			(<AutoNotificationModel[]>data).forEach((autoNotification) => {
				modules.push(new AutoNotificationModule(autoNotification));
			});
		}
	}
});
populate();

psimClient.onReady.subscribe((client: Client) => {
	client.login(process.env['PSIM_USERNAME'], process.env['PSIM_PASSWORD'], true);
});

psimClient.onLogin.subscribe(async (client: Client) => {
	const rooms: string[] = process.env['PSIM_AUTO_JOIN_ROOMS'].split(',').map((room) => room.trim());
	await client.join(...rooms);
	await client.setAvatar(process.env['PSIM_AVATAR']);
});

psimClient.onRoomJoin.subscribe(async (client: Client, room: Room) => {
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

		if (!message.isIntro && message.user.username === 'cheir' && message.text.trim().startsWith('-join')) {
			psimClient.join(message.text.trim().split(' ')[1].trim());
		}

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

psimClient.onPrivateMessage.subscribe(async (user: User, message: PrivateMessage) => {
	modules.forEach(async (module) => {
		if (module.onPrivateMessage) {
			await module.onPrivateMessage(user, message);
		}
	});
});

discordClient.on('ready', () => {
	console.log(`Logged into Discord as ${discordClient.user?.tag}`);
});

discordClient.on('message', (message) => {
	modules.forEach(async (module) => {
		if (module.onDiscordMessage) {
			await module.onDiscordMessage(message);
		}
	});
});

psimClient.connect();
discordClient.login(process.env['DISCORD_TOKEN']);
