import * as path from 'path';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const isFile = (filepath: string) => statSync(filepath).isFile();

const isDirectory = (filepath: string) => statSync(filepath).isDirectory();

const getFiles = (filepath: string) =>
	readdirSync(filepath)
		.map((filename) => join(filepath, filename))
		.filter(isFile);

const getDirectories = (filepath: string) =>
	readdirSync(filepath)
		.map((directory) => join(filepath, directory))
		.filter(isDirectory);

const getFilesRecursively = (filepath: string) => {
	const dirs = getDirectories(filepath);
	const files: string[] = dirs.map((directory) => getFilesRecursively(directory)).reduce((a, b) => a.concat(b), []);

	return files.concat(getFiles(filepath));
};

getFilesRecursively(path.join(__dirname, 'plugins')).forEach((file) => {
	console.log(`[Loading "${file}" plugin]`);
	try {
		require(file);
	} catch (e) {
		console.log(`[Error loading "${file}" plugin: ${e}]`);
	}
});

// todo: move psim and discord to their own plugins which other things can consume
// todo: reimplement different aspects as ATOMIC plugins
// todo: figure out how to get package.json to copy to build (just run with tsc-node for now)

// todo: only keep secretws in envvars, move other stuff to part of their specific plugin
// todo: move utils to plugins

// load modules
/*import RemindDiscordModule from './modules/remindDiscord';
import TournamentsModule from './modules/tournaments';
import AnnouncementInteropModule from './modules/announcementInterop';
import GitModule from './modules/git';
import RoleAssignmentModule from './modules/RoleAssignmentModule';

/*const tours = new TournamentsModule(psimClient, discordClient);

const modules: Module[] = [
	new RemindDiscordModule(55, 'Check out the LC Discord server: https://discord.gg/pjN29Dh'),
	new DebugModule(),
	new AnnouncementInteropModule(psimClient, discordClient),
	new GitModule(),
	tours,
	new RoleAssignmentModule(discordClient)
];

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

*/
