import * as Discord from 'discord.js';

export async function clearReactions(message: Discord.Message): Promise<void> {
	await message.reactions.removeAll();
}

export async function addReactions(message: Discord.Message, emojis: string[]): Promise<void> {
	emojis.forEach(async (emoji) => await message.react(emoji));
}
