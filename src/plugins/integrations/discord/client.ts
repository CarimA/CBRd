import * as Discord from 'discord.js';
import { env } from '../../env';

const discord = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });

discord.on('ready', () => {
	console.log(`Logged into Discord as ${discord.user?.tag}`);
});

discord.login(env['DISCORD_TOKEN']);

export const client = discord;

export async function isSelf(user: Discord.User | Discord.PartialUser): Promise<boolean> {
	if (user.partial) await user.fetch();
	return user.id === discord?.user?.id;
}
