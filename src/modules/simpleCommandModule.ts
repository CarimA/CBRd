import { Client, User, Room, RoomMessage, PrivateMessage } from 'ts-psim-client';
import { SimpleCommandsModel } from '../database/simpleCommands';
import Module from '../module';
import { checkRank, evalTs, isAuthorized } from '../utils';

class SimpleCommandModule implements Module {
	private _command: SimpleCommandsModel;

	constructor(command: SimpleCommandsModel) {
		this._command = command;
	}

	public async onPrivateMessage(user: User, message: PrivateMessage): Promise<void> {
		await this.handleMessage(user, message);
	}

	public async onRoomMessage(client: Client, room: Room, message: RoomMessage): Promise<void> {
		// ignore own messages
		if (message.user.username === process.env['PSIM_USERNAME']?.toLowerCase()) {
			return;
		}

		if (message.isIntro) {
			return;
		}

		await this.handleMessage(message.user, message);
	}

	private async handleMessage(user: User, message: RoomMessage | PrivateMessage): Promise<void> {
		const lowercaseText = message.text.toLowerCase();

		// check that we're actually the command
		if (!lowercaseText.startsWith(this._command.input.toLowerCase())) {
			return;
		}

		// check that the user is above the minimum rank required to run it
		if (this._command.minimumRank) {
			if (
				!(
					isAuthorized(this._command.userOverrides, user.username) || checkRank(message.rank, this._command.minimumRank)
				)
			) {
				return await user.send('You are not authorized to run this command');
			}
		}

		let output = this._command.output;

		// check if it's in the right place
		if (message instanceof PrivateMessage) {
			if (!(this._command.psimRooms.includes('pm') || this._command.psimRooms.includes('global'))) {
				return await user.send('This command cannot be used in PMs');
			}

			output = output.replace('${room}', 'pm');
		} else {
			if (!(this._command.psimRooms.includes(message.room.name) || this._command.psimRooms.includes('global'))) {
				return await user.send('This command cannot be used in this room');
			}

			output = output.replace('${room}', message.room.name);
		}

		const args = message.text.substring(this._command.input.length + 1).split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

		output = output.replace('${sender}', user.displayName);
		output = output.replace('${count}', args.length.toString());

		for (let i = 0; i < args.length; i++) {
			output = output.replace(`\${${i}}`, args[i]);
		}

		// handle any code execution
		const evalBlock = /\${{(.+?)}}/g;
		const matches = output.match(evalBlock);

		if (matches) {
			for (const match of matches) {
				const code = match.substring(3, match.length - 2);
				console.log(code);

				try {
					let result = evalTs(code);
					if (result === '{}' || result === '[]') {
						result = '';
					}

					output = output.replace(match, result);
				} catch (e) {
					console.error(e);
					output = output.replace(match, '(error)');
				}
			}
		}

		if (message instanceof RoomMessage) {
			// check if anybody can send it
			if (!this._command.publicRank) {
				return await message.reply(output);
			}

			// check if the user is an override
			if (this._command.userOverrides.includes(user.username)) {
				return await message.reply(output);
			}

			// check if the user has the rank to send it publicly
			if (checkRank(message.rank, this._command.publicRank)) {
				return await message.reply(output);
			} else {
				return await user.send(output);
			}
		} else {
			await message.reply(output);
		}
	}
}

export default SimpleCommandModule;
