import * as Psim from 'ts-psim-client';
import * as Discord from 'discord.js';
import Module from '../module';

export default class BridgeModule implements Module {
	private _psimClient: Psim.Client;
	private _discordClient: Discord.Client;

    private _discordRoom = '1228729440893407312';
    private _psimRoom = 'littlecup'

	constructor(psimClient: Psim.Client, discordClient: Discord.Client) {
		this._psimClient = psimClient;
		this._discordClient = discordClient;
	}

	public async onDiscordMessage(message: Discord.Message): Promise<void> {
		if (message.channel.id === this._discordRoom) {
			const room = this._psimClient.getRoom(this._psimRoom);

			const guild = await this._discordClient.guilds.fetch(<string>process.env['DISCORD_SERVER_ID']);
			const member = guild.member(message.author);
			const nickname = member ? member.displayName : message.author.username;
        
            if (nickname.toLocaleLowerCase() === 'cheirbot redux')
                return;

			const md = message.content.replace(/\n/g, '. ');

			await room?.send(`**${[nickname]}: ** ${md}`);
		}
	}

	public async onRoomMessage(client: Psim.Client, room: Psim.Room, message: Psim.RoomMessage): Promise<void> {
		// ignore own messages
		if (message.user.username === process.env['PSIM_USERNAME']?.toLowerCase()) {
			return;
		}

		if (message.isIntro) {
			return;
		}

		const guild = await this._discordClient.guilds.fetch(<string>process.env['DISCORD_SERVER_ID']);
		const channel = <Discord.TextChannel>guild.channels.cache.get(this._discordRoom);
        const text = `**${message.user.displayName}:** ${message.text}`;

		await channel.send(text);
	}
}
