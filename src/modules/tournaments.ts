import { Client, PrivateMessage, Room, RoomMessage, User, Utils } from 'ts-psim-client';
import Module from '../module';
import { CronJob } from 'cron';
import fetch from 'node-fetch';
import { Teams } from '@pkmn/sets';
import moment = require('moment');

import { titleCase, mod, shuffleArray, random } from '../utils';

import * as formats from '../config/formats.json';
import { Format } from '../config/formats';

export default class TournamentsModule implements Module {
	private _psimClient: Client;
	private _nextFormat: string;
	private _votingStopsAt: Date | undefined;
	private _tournamentStartsAt: Date | undefined;
	private _votingPhase: boolean;
	private _activeVote: { [key: string]: User[] };
	private _room: string;

	constructor(psimClient: Client) {
		this._psimClient = psimClient;
		this._nextFormat = 'lc';
		this._activeVote = {};
		this._votingPhase = false;
		this._room = 'botdevelopment';

		this.scheduleTournament(0);
		this.scheduleTournament(4, 'lc');
		this.scheduleTournament(12);
		this.scheduleTournament(14, 'lc');
		this.scheduleTournament(16);
		this.scheduleTournament(18, 'lc');
		this.scheduleTournament(20, 'lcuu');
		this.scheduleTournament(22);
	}

	private scheduleTournament(hour: number, format?: string | undefined) {
		if (!format) {
			// if there is no set format, one hour before it, start a vote
			new CronJob(`0 0 ${mod(hour - 1, 24)} * * *`, this.startVote(hour), null, true, 'Europe/London').start();

			// 20 minutes before it, stop the vote and make that the next format
			new CronJob(`0 40 ${mod(hour - 1, 24)} * * *`, this.stopVote, null, true, 'Europe/London').start();
		}

		new CronJob(`0 0 ${hour} * * *`, this.runTournament(format), null, true, 'Europe/London').start();
	}

	public async onPrivateMessage(user: User, message: PrivateMessage): Promise<void> {
		const vote = message.text;

		if (!vote.startsWith('-vote')) {
			return;
		}

		if (Object.keys(this._activeVote).length === 0) {
			return await message.reply('There is currently no active room tournament vote. Try again another time.');
		}

		const format = vote.split(' ')[1];

		if (this._activeVote[format]) {
			// Check if the user is in any of the votes
			let changed = undefined;
			Object.entries(this._activeVote).forEach(([key, value]) => {
				const index = value.indexOf(user, 0);
				if (index > -1) {
					value.splice(index, 1);
					changed = key;
				}
			});

			this._activeVote[format].push(user);

			if (changed) {
				if (changed === format) {
					return await message.reply('I heard you.');
				} else {
					return await message.reply(`Vote changed from ${changed} to ${format}.`);
				}
			} else {
				return await message.reply(`Vote added for ${format}.`);
			}
		} else {
			return await message.reply('This is not an option you can vote for.');
		}
	}

	public startVote(hour: number) {
		return async () => {
			this._votingStopsAt = new Date();
			this._votingStopsAt.setHours(mod(hour - 1, 24), 40);

			this._tournamentStartsAt = new Date();
			this._tournamentStartsAt.setHours(hour);

			console.log('start');

			// pick 2-6 formats from the list
			const amount = random(1, 4);
			let metagames = Object.keys(formats);
			metagames.splice(metagames.indexOf('lc'), 1);
			metagames.splice(metagames.indexOf('default'), 1);
			metagames = shuffleArray(metagames);
			metagames = metagames.slice(0, amount);
			metagames.unshift('lc');

			this._activeVote = {};
			metagames.forEach((metagame) => {
				this._activeVote[metagame] = [];
				console.log(metagame);
			});

			this._votingPhase = true;
			this.updateInformation();
		};
	}

	public async stopVote(): Promise<void> {
		console.log('stop');

		// get the format with the most items
		this._nextFormat = Object.keys(this._activeVote).reduce((a: string, b: string) => {
			if (this._activeVote[a].length == this._activeVote[b].length) {
				// in the event of a tiebreak, coinflip
				if (random(0, 1) === 0) {
					return a;
				} else {
					return b;
				}
			} else {
				if (this._activeVote[a].length > this._activeVote[b].length) {
					return a;
				} else {
					return b;
				}
			}
		});

		const room = this._psimClient.getRoom(this._room);
		Object.keys(this._activeVote).forEach(async (key) => {
			await room?.send(`[DEBUG] ${this._activeVote[key].length} votes for ${key}`);
		});

		this._activeVote = {};
		this.updateInformation();
	}

	public runTournament(format?: string | undefined) {
		return async () => {
			this._votingPhase = false;
			const room = this._psimClient.getRoom(this._room);
			const nextFormat = format || this._nextFormat;

			const game = <Format>(<any>formats)[nextFormat];
			const name = game['name'];
			const ruleset = game['format'] || 'gen8lc';
			const type = game['type'] || '2 elimination';

			let bannedPokemon = game.rules.bannedPokemon || [];
			let unbannedPokemon = game.rules.unbannedPokemon || [];
			let bannedAbilities = game.rules.bannedAbilities || [];
			let unbannedAbilities = game.rules.unbannedAbilities || [];
			let bannedMoves = game.rules.bannedMoves || [];
			let unbannedMoves = game.rules.unbannedMoves || [];
			let bannedItems = game.rules.bannedItems || [];
			let unbannedItems = game.rules.unbannedItems || [];

			if (game.rules.inheritBans) {
				game.rules.inheritBans.forEach((inheritedFormat: any) => {
					const inheritedGame = <Format>(<any>formats)[inheritedFormat];
					bannedPokemon = bannedPokemon.concat(inheritedGame.rules.bannedPokemon || []);
					unbannedPokemon = unbannedPokemon.concat(inheritedGame.rules.unbannedPokemon || []);
					bannedAbilities = bannedAbilities.concat(inheritedGame.rules.bannedAbilities || []);
					unbannedAbilities = unbannedAbilities.concat(inheritedGame.rules.unbannedAbilities || []);
					bannedMoves = bannedMoves.concat(inheritedGame.rules.bannedMoves || []);
					unbannedMoves = unbannedMoves.concat(inheritedGame.rules.unbannedMoves || []);
					bannedItems = bannedItems.concat(inheritedGame.rules.bannedItems || []);
					unbannedItems = unbannedItems.concat(inheritedGame.rules.unbannedItems || []);
				});
			}

			if (game.rules.inheritBansAsUnbans) {
				game.rules.inheritBansAsUnbans.forEach((inheritedFormat: any) => {
					const inheritedGame = <Format>(<any>formats)[inheritedFormat];
					unbannedPokemon = unbannedPokemon.concat(inheritedGame.rules.bannedPokemon || []);
					unbannedAbilities = unbannedAbilities.concat(inheritedGame.rules.bannedAbilities || []);
					unbannedMoves = unbannedMoves.concat(inheritedGame.rules.bannedMoves || []);
					unbannedItems = unbannedItems.concat(inheritedGame.rules.bannedItems || []);
				});
			}

			const html = await this.generateEmbed(
				game,
				bannedPokemon,
				unbannedPokemon,
				bannedAbilities,
				unbannedAbilities,
				bannedMoves,
				unbannedMoves,
				bannedItems,
				unbannedItems
			);

			const bans = (bannedPokemon || [])
				.concat(bannedAbilities || [])
				.concat(bannedMoves || [])
				.concat(bannedItems || [])
				.map((ban) => `-${ban}`);

			const unbans = (unbannedPokemon || [])
				.concat(unbannedAbilities || [])
				.concat(unbannedMoves || [])
				.concat(unbannedItems || [])
				.map((unban) => `+${unban}`);

			const rules = (bans || []).concat(unbans || []);

			await room?.send(`/addhtmlbox ${html}`);
			await room?.createTournament(name, ruleset, type, 64, 5, 1, rules, true, true);
			await Utils.delay(60 * 5 * 1000);
			await room?.send('/tour start');
		};
	}

	private async generateEmbed(
		format: Format,
		bannedPokemon?: string[] | undefined,
		unbannedPokemon?: string[] | undefined,
		bannedAbilities?: string[] | undefined,
		unbannedAbilities?: string[] | undefined,
		bannedMoves?: string[] | undefined,
		unbannedMoves?: string[] | undefined,
		bannedItems?: string[] | undefined,
		unbannedItems?: string[] | undefined
	): Promise<string> {
		const bannedPokemonIcons = bannedPokemon
			?.sort((a, b) => a.localeCompare(b))
			.map((pokemon) => `<psicon pokemon='${pokemon.replace('-base', '')}'>`)
			.join('');

		const unbannedPokemonIcons = unbannedPokemon
			?.sort((a, b) => a.localeCompare(b))
			.map((pokemon) => `<psicon pokemon='${pokemon}'>`)
			.join('');

		const bannedOtherText = (bannedAbilities || [])
			.concat(bannedMoves || [])
			.concat(bannedItems || [])
			.map((text) => titleCase(text))
			.sort((a, b) => a.localeCompare(b))
			.join(', ');

		const unbannedOtherText = (unbannedAbilities || [])
			.concat(unbannedMoves || [])
			.concat(unbannedItems || [])
			.map((text) => titleCase(text))
			.sort((a, b) => a.localeCompare(b))
			.join(', ');

		let samples: string[] = [];
		if (format.sampleTeams) {
			samples = shuffleArray(format.sampleTeams);
			samples = await Promise.all(format.sampleTeams.map(async (team) => await this.generateSampleTeamEmbed(team)));
		}

		const html = `<h1>${format.name}</h1>${format.about ? `<p>${format.about}</p>` : ''}${
			bannedPokemonIcons
				? `<details><summary><strong>Banned Pokemon:</strong></summary><p>${bannedPokemonIcons}</p></details>`
				: ''
		}${
			unbannedPokemonIcons
				? `<details><summary><strong>Unbanned Pokemon:</strong></summary><p>${unbannedPokemonIcons}</p></details>`
				: ''
		}${
			bannedOtherText
				? `<details><summary><strong>Banned Abilities/Moves/Items:</strong></summary><p>${bannedOtherText}</p></details>`
				: ''
		}${
			unbannedOtherText
				? `<details><summary><strong>Unbanned Abilities/Moves/Items:</strong></summary><p>${unbannedOtherText}</p></details>`
				: ''
		}<br>${
			samples && samples.length > 0
				? `<strong>Sample Teams:</strong><p>${samples.join('')}</p>`
				: '<strong>This format has no sample teams :(</strong><p>Have some to donate? Send a message to Cheir!</p>'
		}${
			format.resources && format.resources.length > 0
				? `<details><summary><strong>Other Resources:</strong></summary><p>${format.resources
						.map((item) => `<a target='_blank' href='${item.url}'>${item.name}</a>`)
						.join(' ')}</p></details>`
				: ''
		}`;

		return html;
	}

	private async generateSampleTeamEmbed(url: string): Promise<string> {
		const response = await fetch(url);
		const json = await response.json();

		const title: string = (await json.title) || 'Sample Team';
		const author: string = (await json.author) || 'an unknown contributor';

		const paste: string = await json.paste;
		const parsed = Teams.importTeam(paste);
		const embed: string = paste.replace(/\r\n/g, '<br>').replace(/\n/g, '');

		const icons = parsed?.team
			.map((pokemon) => pokemon.species)
			.map((pokemon) => `<psicon pokemon='${pokemon}'>`)
			.join('');

		const html = `<details><summary>${icons} ${title} by ${author}</summary><pre>${embed}</pre></details>`;
		return html;
	}

	public async onRoomMessage(client: Client, room: Room, message: RoomMessage): Promise<void> {
		if (room.name !== this._room) {
			return;
		}

		if (message.isIntro) {
			return;
		}

		if (message.user.username === process.env['PSIM_USERNAME']?.toLowerCase()) {
			return;
		}

		this.updateInformation();
	}

	private async updateInformation(): Promise<void> {
		if (!this._votingPhase) {
			return;
		}

		const voteEnds = moment().to(this._votingStopsAt);
		const tourStarts = moment().to(this._tournamentStartsAt);

		const room = this._psimClient.getRoom(this._room);

		if (Object.keys(this._activeVote).length === 0) {
			await room?.send(
				`/adduhtml vote, <p>Voting closed - ${
					(<any>formats)[this._nextFormat].name
				} Tournament starts ${tourStarts}</p>`
			);
		} else {
			await room?.send(
				`/adduhtml vote, <p>Vote for the next tournament - Tournament starts ${tourStarts} - Voting closes ${voteEnds}<br><br>${Object.keys(
					this._activeVote
				)
					.map(
						(metagame) =>
							`<button name="send" value="/msg ${process.env['PSIM_USERNAME']}, -vote ${metagame}">${<Format>(
								(<any>formats)[metagame].name
							)}</button>`
					)
					.join('')}</p>`
			);
		}
	}
}
