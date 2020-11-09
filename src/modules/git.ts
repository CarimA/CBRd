/**
 * Commands for interfacing with the Git repository
 * @author Annika
 */

import { Client, PrivateMessage, Room, RoomMessage, User } from 'ts-psim-client';
import { exec } from 'child_process';
import Module from '../module';

/**
 * Array of user IDs who are allowed to perform system administration tasks,
 * such as syncing with a remote Git repository.
 */
const SYSADMINS = ['cheir'];
const REPO_LINK = 'https://github.com/CarimA/CBRd';
const TOID_REGEX = new RegExp('[^a-z0-9]', 'g');

async function sendRepoLink(message: RoomMessage | PrivateMessage) {
	return message.reply(`This bot's source code is available at ${REPO_LINK}.`);
}

async function updateRepository(message: RoomMessage | PrivateMessage) {
	// We can't get a userid from the object....
	const userid = message.user.username.toLowerCase().replace(TOID_REGEX, '');
	if (!SYSADMINS.includes(userid)) {
		return message.reply('Only bot sysadmins can update the Git repository.');
	}
	await message.reply('Updating code from the Git repository.');

	// This currently just runs git pull.
	// If you have issues with merge conflicts this can be made more complex.
	exec(`git pull`, async (error, stdout, stderr) => {
		if (error) {
			await message.reply(`An error occurred while pulling from the Git repository: ${error.message}`);
		} else {
			await message.reply(`!code ${stdout + stderr}`);
			await message.reply('Pulled from the Git repository!');
		}
	});
}

export default class GitModule implements Module {
	/** commands:handler Map */
	commands = new Map<string[], (message: RoomMessage | PrivateMessage) => Promise<void>>([
		[['-repo', '-git'], sendRepoLink],
		[['-update', '-syncgit'], updateRepository]
	]);

	public async onRoomMessage(client: Client, room: Room, message: RoomMessage): Promise<void> {
		await this.handleMessage(message);
	}

	public async onPrivateMessage(user: User, message: PrivateMessage): Promise<void> {
		await this.handleMessage(message);
	}

	private async handleMessage(message: RoomMessage | PrivateMessage): Promise<void> {
		const lowercaseText = message.text.toLowerCase();
		for (const [commands, handler] of this.commands) {
			if (commands.some((cmd) => lowercaseText.startsWith(cmd))) {
				await handler(message);
			}
		}
	}
}
