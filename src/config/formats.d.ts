export interface Rules {
	inheritBans: string[] | undefined;
	inheritBansAsUnbans: string[] | undefined;

	bannedPokemon: string[] | undefined;
	bannedAbilities: string[] | undefined;
	bannedItems: string[] | undefined;
	bannedMoves: string[] | undefined;
	unbannedPokemon: string[] | undefined;
	unbannedAbilities: string[] | undefined;
	unbannedItems: string[] | undefined;
	unbannedMoves: string[] | undefined;
	customRules: string[] | undefined;

	minPick: number | undefined;
	maxPick: number | undefined;
}

export interface Format {
	name: string;
	about: string | undefined;
	format: string | undefined;
	type: string | undefined;
	rules: Rules;
	sampleTeams: string[] | undefined;
	resources: Resource[] | undefined;
	discordRole: string | undefined;
}

export interface Resource {
	name: string;
	url: string;
}
