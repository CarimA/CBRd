import { Client } from 'ts-psim-client';
import { env } from '../../env';
import { client } from './client';

client.onReady.subscribe((client: Client) => {
	client.login(env['PSIM_USERNAME'], env['PSIM_PASSWORD'], true);
});

export const onLogin = client.onLogin;
export const onRoomJoin = client.onRoomJoin;
export const onRoomLeave = client.onRoomLeave;
export const onPrivateMessage = client.onPrivateMessage;
