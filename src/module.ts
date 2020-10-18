import { Client, PrivateMessage, Room, RoomMessage, User } from 'ts-psim-client';

export default interface Module {
	onRoomJoin?(client: Client, room: Room): Promise<void>;
	onRoomMessage?(client: Client, room: Room, message: RoomMessage): Promise<void>;
	onPrivateMessage?(user: User, message: PrivateMessage): Promise<void>;
}
