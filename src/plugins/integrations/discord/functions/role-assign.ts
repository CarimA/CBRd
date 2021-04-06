import * as Discord from 'discord.js';
import { client, isSelf } from '../client';
import { getChannelById, getGuildById, getMessageById } from '../utils/guild';
import { addReactions, clearReactions } from '../utils/reactions';
import { addRoles, removeRoles } from '../utils/roles';

const getEmoji = (role: { emoji: string; roleId: string }) => role.emoji;
const getRoleId = (role: { emoji: string; roleId: string }) => role.roleId;
const isEmojiMatching = (reaction: Discord.MessageReaction) => {
	return (role: { emoji: string; roleId: string }) => {
		return role.emoji === reaction.emoji.id || role.emoji === reaction.emoji.name;
	};
};

export async function setRoleAssign(
	guildId: string,
	channelId: string,
	messageId: string,
	roles: { emoji: string; roleId: string }[],
	unique = false
): Promise<void> {
	client.once('ready', async () => {
		const guild = await getGuildById(guildId);
		const channel = await getChannelById(guild, channelId);

		const textChannel = <Discord.TextChannel>channel;
		await textChannel.fetch(true);

		const message = await getMessageById(textChannel, messageId);

		await clearReactions(message);
		await addReactions(message, roles.map(getEmoji));
		await message.fetch(true);

		const action = async (
			successAction: (user: Discord.GuildMember, roles: string[]) => Promise<void>,
			handleUnique: boolean
		) => async (reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) => {
			if (reaction.partial) await reaction.fetch();
			if (reaction.message.partial) await reaction.message.fetch();
			if (user.partial) await user.fetch();
			if (await isSelf(user)) return;

			if (reaction.message.id === message.id) {
				const results = roles.filter(isEmojiMatching(reaction));
				if (results.length > 0) {
					const guildUser = await reaction.message.guild?.members.fetch(user.id);

					if (!guildUser) return;
					if (unique && handleUnique) await removeRoles(guildUser, roles.map(getRoleId));
					await successAction(guildUser, results.map(getRoleId));
				} else {
					await reaction.remove();
				}
			}
		};

		client.on('messageReactionAdd', await action(addRoles, true));
		client.on('messageReactionRemove', await action(removeRoles, false));
	});
}
