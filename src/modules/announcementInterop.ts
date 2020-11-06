import * as Psim from 'ts-psim-client';
import * as Discord from 'discord.js';
import Module from '../module';

import * as config from '../config/discord.json';
import { DiscordConfig } from '../config/discord';

export default class AnnouncementInteropModule implements Module {
	private _psimClient: Psim.Client;
	private _discordClient: Discord.Client;

	private _room: string;

	constructor(psimClient: Psim.Client, discordClient: Discord.Client) {
		this._psimClient = psimClient;
		this._discordClient = discordClient;
		this._room = process.env['PSIM_TOUR_ROOM'] ? process.env['PSIM_TOUR_ROOM'] : 'littlecup';
	}

	public async onDiscordMessage(message: Discord.Message): Promise<void> {
		if (message.channel.id === config.announcementChannel) {
			const room = this._psimClient.getRoom(this._room);

			const guild = await this._discordClient.guilds.fetch(config.serverId);
			const member = guild.member(message.author);
			const nickname = member ? member.displayName : message.author.username;
			const color = member ? member.displayHexColor : '#ffffff';
			const avatar = message.author.displayAvatarURL();

			//  - <em><a href="${message.url}">(Link to message)</a></em>
			await room?.send(
				`/adduhtml ${Date.now()}, <p><span style="font-size: 1rem">Discord Announcement (<a href="https://discord.gg/pjN29Dh">LC Discord Server</a>)</span><br><img src="${avatar}" width="18" height="18" style="vertical-align:bottom;border-radius:50%"> <strong style="color:${color}">${nickname}</strong></p><p>${
					message.content
				}</p>`
			);
		}
	}
}
