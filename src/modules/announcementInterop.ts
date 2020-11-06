import * as Psim from 'ts-psim-client';
import * as Discord from 'discord.js';
import Module from '../module';
import * as Marked from 'marked';
import sanitizeHtml from 'sanitize-html';
import * as HTMLMinifier from 'html-minifier';

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
		if (message.channel.id === process.env['DISCORD_ANNOUNCE_CHANNEL']) {
			const room = this._psimClient.getRoom(this._room);

			const guild = await this._discordClient.guilds.fetch(<string>process.env['DISCORD_SERVER_ID']);
			const member = guild.member(message.author);
			const nickname = member ? member.displayName : message.author.username;
			const color = member ? member.displayHexColor : '#ffffff';
			const avatar = message.author.displayAvatarURL();

			const md = message.content;
			const html = Marked.parse(md);
			const sanitised = sanitizeHtml(html);
			const minified = HTMLMinifier.minify(sanitised);

			await room?.send(
				`/adduhtml ${Date.now()}, <p><span style="font-size: 1rem">Discord Announcement (<a href="https://discord.gg/pjN29Dh">LC Discord Server</a>)</span><br><img src="${avatar}" width="18" height="18" style="vertical-align:bottom;border-radius:50%"> <strong style="color:${color}">${nickname}</strong></p><p>${minified}</p>`
			);
		}
	}
}
