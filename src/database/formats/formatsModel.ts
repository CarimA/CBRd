class FormatsModel {
	name: string;
	slug: string;
	about: string;
	tournament: string;
	type: string;
	simRules: string;
	bannedPokemon: string;
	unbannedPokemon: string;
	bannedAbilities: string;
	unbannedAbilities: string;
	bannedMoves: string;
	unbannedMoves: string;
	bannedItems: string;
	unbannedItems: string;
	inheritBans: string;
	inheritBansAsUnbans: string;
	discordRole: string;

	constructor(name: string, slug: string, about: string, tournament: string, type: string, simRules: string, bannedPokemon: string, unbannedPokemon: string, bannedAbilities: string, unbannedAbilities: string,
		bannedMoves: string, unbannedMoves: string, bannedItems: string, unbannedItems: string, inheritBans: string, inheritBansAsUnbans: string, discordRole: string) {
		this.name = name;
		this.slug = slug;
		this.about = about;
		this.tournament = tournament;
		this.type = type;
		this.simRules = simRules;
		this.bannedPokemon = bannedPokemon;
		this.unbannedPokemon = unbannedPokemon;
		this.bannedAbilities = bannedAbilities;
		this.unbannedAbilities = unbannedAbilities;
		this.bannedMoves = bannedMoves;
		this.unbannedMoves = unbannedMoves;
		this.bannedItems = bannedItems;
		this.unbannedItems = unbannedItems;
		this.inheritBans = inheritBans;
		this.inheritBansAsUnbans = inheritBansAsUnbans;
		this.discordRole = discordRole;
	}
}

export default FormatsModel;
