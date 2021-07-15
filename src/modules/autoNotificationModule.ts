import moment from 'moment';
import { Client, Room, RoomMessage } from 'ts-psim-client';
import { AutoNotificationModel } from '../database/autoNotifications';
import Module from '../module';

class AutoNotificationModule implements Module {
	private _messageCounter: number;
	private _lastPosted: number;
	private _notification: AutoNotificationModel;

	constructor(notification: AutoNotificationModel) {
		this._messageCounter = 0;
		this._lastPosted = moment.now();
		this._notification = notification;
	}

	private resetCounter(): void {
		this._messageCounter = 0;
		this._lastPosted = moment.now();
	}

	private incrementCounter(): void {
		this._messageCounter++;
	}

	public async onRoomJoin(client: Client, room: Room): Promise<void> {
		if (room.name === this._notification.psimRoom) {
			this.resetCounter();
		}
	}

	public async onRoomMessage(client: Client, room: Room, message: RoomMessage): Promise<void> {
		// don't count own messages
		if (message.user.username === process.env['PSIM_USERNAME']?.toLowerCase()) {
			return;
		}

		if (room.name === this._notification.psimRoom && !message.isIntro) {
			this.incrementCounter();

			const isAfter = moment().isAfter(moment(this._lastPosted).add(this._notification.minimumWait, 'minutes'));
			if (this._messageCounter >= this._notification.minimumMessages && isAfter) {
				await message.reply(this._notification.message);
				this.resetCounter();
			}
		}
	}
}

export default AutoNotificationModule;
