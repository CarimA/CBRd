import { client } from './client';
import * as Discord from 'discord.js';
import { SimpleEventDispatcher, ISimpleEvent } from 'strongly-typed-events';

const onMessageInterop = new SimpleEventDispatcher<Discord.Message>();

client.on('message', (message) => {
	onMessageInterop.dispatch(message);
});

export const onMessage: ISimpleEvent<Discord.Message> = onMessageInterop.asEvent();
