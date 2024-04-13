import * as Psim from 'ts-psim-client';
import * as Discord from 'discord.js';
import Module from '../module';
import { checkRank } from '../utils';

export default class BridgeModule implements Module {
	private _psimClient: Psim.Client;
	private _discordClient: Discord.Client;

    private _discordRoom = '1228729440893407312';
    private _psimRoom = 'littlecup';
    private _enabled = true;

	constructor(psimClient: Psim.Client, discordClient: Discord.Client) {
		this._psimClient = psimClient;
		this._discordClient = discordClient;
	}

	public async onDiscordMessage(message: Discord.Message): Promise<void> {
        if (!this._enabled)
            return;

		if (message.channel.id === this._discordRoom) {
			const room = this._psimClient.getRoom(this._psimRoom);

			const guild = await this._discordClient.guilds.fetch(<string>process.env['DISCORD_SERVER_ID']);
			const member = guild.member(message.author);
			const nickname = member ? member.displayName : message.author.username;
        
            if (nickname.toLocaleLowerCase() === 'cheirbot redux')
                return;

			const md = message.content.replace(/\n/g, '. ').trim();

            if (!md)
                return;
        
            // disallow chat commands
            if (md.startsWith('/'))
                return;

            if (md.startsWith('!'))
                return;

            if (md.includes('discord.gg'))
                return;

			await room?.send(`**${[nickname]}:** ${md}`);
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

        if (checkRank(message.rank, '%') && message.text.trim() === '-togglebridge')
        {
            this._enabled = !this._enabled;

            let notif = `**LC Room ⇔ Discord Bridge ${this._enabled ? 'enabled' : 'disabled'}.**`;
			let room = this._psimClient.getRoom(this._psimRoom);

			await room?.send(notif);
		    await channel.send(notif);
        }

        if (!this._enabled)
            return;

        const msg = message.text.trim();
        const text = `**${message.rank}${message.user.displayName}:** ${msg}`.trim();

        if (!text)
            return;

        // don't pass through chat commands
        if (msg.startsWith('/'))
            return;

        if (msg.startsWith('!'))
            return;

		await channel.send(text);
	}
}
