import { Client, Room, RoomMessage } from 'ts-psim-client';
import Module from '../module';
import { isLittleCup } from '../utils';

export default class RemindDiscordModule implements Module {
	private _messageCounter: number;
	private _limit: number;
	private _message: string;

	constructor(postAt: number, message: string) {
		this._messageCounter = 0;
		this._limit = postAt;
		this._message = message;
	}

	private resetCounter(): void {
		this._messageCounter = 0;
	}

	private incrementCounter(): void {
		this._messageCounter++;
	}

	public async onRoomJoin(client: Client, room: Room): Promise<void> {
		if (isLittleCup(room)) {
			this.resetCounter();
		}
	}

	public async onRoomMessage(client: Client, room: Room, message: RoomMessage): Promise<void> {
		if (isLittleCup(room) && !message.isIntro) {
			this.incrementCounter();

			if (this._messageCounter >= this._limit) {
				await message.reply(this._message);
				this.resetCounter();
			}
		}
	}
}
