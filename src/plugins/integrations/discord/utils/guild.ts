import * as Discord from 'discord.js';
import { client } from '../client';

export async function getGuildById(guildId: string): Promise<Discord.Guild> {
	const guild = await client.guilds.fetch(guildId);
	if (!guild) throw new Error(`Could not find guild: ${guildId}`);
	await guild.fetch();
	return guild;
}

export async function getChannelById(guild: Discord.Guild, channelId: string): Promise<Discord.GuildChannel> {
	const channel = await guild.channels.resolve(channelId);
	if (!channel) throw new Error(`Could not find channel: ${channelId}`);
	await channel.fetch();
	return channel;
}

export async function getMessageById(channel: Discord.TextChannel, messageId: string): Promise<Discord.Message> {
	const message = (await channel.messages.fetch({ around: messageId, limit: 1 })).first();
	if (!message) throw new Error(`Could not find message: ${messageId}`);
	await message.fetch();
	return message;
}
