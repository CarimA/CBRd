import { Client, Room, RoomMessage } from 'ts-psim-client';
import Module from '../module';
import { CronJob } from 'cron';
import fetch from 'node-fetch';
import { Teams } from '@pkmn/sets';

import { titleCase, mod, shuffleArray } from '../utils';

import * as formats from '../config/formats.json';

export default class TournamentsModule implements Module {
	private _psimClient: Client;
	private _nextFormat: string;

	constructor(psimClient: Client) {
		this._psimClient = psimClient;
		this._nextFormat = 'lc';

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
			new CronJob(`0 0 ${mod(hour - 1, 24)} * * *`, this.startVote, null, true, 'Europe/London').start();

			// 20 minutes before it, stop the vote and make that the next format
			new CronJob(`0 40 ${mod(hour - 1, 24)} * * *`, this.stopVote, null, true, 'Europe/London').start();
		}

		new CronJob(`0 0 ${hour} * * *`, this.runTournament(format), null, true, 'Europe/London').start();
	}

	private async startVote(): Promise<void> {
		console.log('start');
	}

	private async stopVote(): Promise<void> {
		console.log('stop');
	}

	public async testTournament(format: string): Promise<void> {
		this.runTournament(format)();
	}

	private runTournament(format?: string | undefined) {
		return async () => {
			const room = this._psimClient.getRoom('botdevelopment');
			const nextFormat = format || this._nextFormat;

			const game = (<any>formats)[nextFormat];
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
					const inheritedGame = (<any>formats)[inheritedFormat];
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
					const inheritedGame = (<any>formats)[inheritedFormat];
					unbannedPokemon = unbannedPokemon.concat(inheritedGame.rules.bannedPokemon || []);
					unbannedAbilities = unbannedAbilities.concat(inheritedGame.rules.bannedAbilities || []);
					unbannedMoves = unbannedMoves.concat(inheritedGame.rules.bannedMoves || []);
					unbannedItems = unbannedItems.concat(inheritedGame.rules.bannedItems || []);
				});
			}

			const html = await this.generateEmbed(
				game.name,
				game.about,
				bannedPokemon,
				unbannedPokemon,
				bannedAbilities,
				unbannedAbilities,
				bannedMoves,
				unbannedMoves,
				bannedItems,
				unbannedItems,
				game.sampleTeams,
				game.resources
			);

			room?.send(`/addhtmlbox ${html}`);
		};
	}

	private async generateEmbed(
		name: string,
		about?: string | undefined,
		bannedPokemon?: string[] | undefined,
		unbannedPokemon?: string[] | undefined,
		bannedAbilities?: string[] | undefined,
		unbannedAbilities?: string[] | undefined,
		bannedMoves?: string[] | undefined,
		unbannedMoves?: string[] | undefined,
		bannedItems?: string[] | undefined,
		unbannedItems?: string[] | undefined,
		sampleTeams?: string[] | undefined,
		otherResources?: any[] | undefined
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
		if (sampleTeams) {
			sampleTeams = shuffleArray(sampleTeams);
			samples = await Promise.all(sampleTeams.map(async (team) => await this.generateSampleTeamEmbed(team)));
		}

		const html = `<h1>${name}</h1>${about ? `<p>${about}</p>` : ''}${
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
				? `<details><summary><strong>Sample Teams:</strong></summary><p>${samples.join('')}</p></details>`
				: '<strong>This format has no sample teams :(</strong><p>Have some to donate? Send a message to Cheir!</p>'
		}${
			otherResources && otherResources.length > 0
				? `<details><summary><strong>Other Resources:</strong></summary><p>${otherResources
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
		if (!message.isIntro && message.text.trim() === '(tada)' && message.user.username === 'cheir') {
			message.reply('🎉🎉🎉');
		}
	}
}
