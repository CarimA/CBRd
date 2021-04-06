import * as Discord from 'discord.js';

export async function addRoles(user: Discord.GuildMember, roles: string[]): Promise<void> {
	roles.forEach(async (role) => await user.roles.add(role));
}

export async function removeRoles(user: Discord.GuildMember, roles: string[]): Promise<void> {
	roles.forEach(async (role) => await user.roles.remove(role));
}
