import { Client, Room, RoomMessage } from 'ts-psim-client';
import Module from '../module';

export default class RemindDiscordModule implements Module {
	public async onRoomMessage(client: Client, room: Room, message: RoomMessage): Promise<void> {
		if (!message.isIntro && message.text.trim() === '(tada)' && message.user.username === 'cheir') {
			message.reply('🎉🎉🎉');
		}
	}
}
