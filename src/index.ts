import dotenv from 'dotenv';
import { Client, Room, User, RoomMessage, PrivateMessage } from 'ts-psim-client';
import Express from 'express';

// assign types to expected env vars
declare let process: {
	env: {
		PORT: number;
		PSIM_USERNAME: string;
		PSIM_PASSWORD: string;
		PSIM_AVATAR: string;
		PSIM_AUTO_JOIN_ROOMS: string;
	};
};
dotenv.config();

// heroku requires that apps serve a web page to stay up
const express = Express();
express.use('/', (req, res) => res.send('go away'));
express.listen(process.env['PORT'] || 3000);

const psimClient = new Client({ debug: true });

// load modules
import Module from './module';
import RemindDiscordModule from './modules/remindDiscord';
import DebugModule from './modules/debug';
import TournamentsModule from './modules/tournaments';

const tours = new TournamentsModule(psimClient);

const modules: Module[] = [
	new RemindDiscordModule(70, 'Check out the LC Discord server: https://discord.gg/pjN29Dh'),
	new DebugModule(),
	tours
];

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

psimClient.connect();

/*

// schedule the LC UU tournament at 8pm

// schedule the random tournaments
new CronJob('0 0 22 * * *', runTour(), null, true, 'Europe/London').start();
new CronJob('0 0 0 * * *', runTour('lc'), null, true, 'Europe/London').start();
new CronJob('0 0 4 * * *', runTour('lc'), null, true, 'Europe/London').start();

// tournament scheduler
setInterval(() => {
	// do nothing if we're not connected to psim
	if (!(psimClient.isConnected() && psimClient.isLoggedIn())) {
		console.log('Not connected or logged in to psim');
		return;
	}
}, 1000 * 30);

/*

import fs from 'fs'
var t = fs.readFileSync('config/sample_teams/test.txt')
console.log(t)

function config(key: string) {
	return process.env[key];
}



console.log(config('USERNAME'));

console.log('Hello world!');


*/
