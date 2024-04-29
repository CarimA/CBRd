import { Client, PrivateMessage, Room, RoomMessage, User } from 'ts-psim-client';
import * as Discord from 'discord.js';

export default interface Module {
	initialise?(): Promise<void>;
	onRoomJoin?(client: Client, room: Room): Promise<void>;
	onRoomMessage?(client: Client, room: Room, message: RoomMessage): Promise<void>;
	onPrivateMessage?(user: User, message: PrivateMessage): Promise<void>;
	onDiscordMessage?(message: Discord.Message): Promise<void>;
	onDiscordEditMessage?(oldMessage: Discord.Message | Discord.PartialMessage, newMessage: Discord.Message | Discord.PartialMessage): Promise<void>;
}
