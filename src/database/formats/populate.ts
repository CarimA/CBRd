import { retrieve } from '..';
import { data as d, FormatsModel, clearData, onPopulate } from '.';

async function populate(): Promise<void> {
	const results = await retrieve('Formats', 16);
	if (!results) {
		return onPopulate.dispatch(['Data is empty', null]);
	}

	clearData();

	results.forEach((result) => {
		const [name, slug, about, tournament, type, sim_rules, banned_pokemon, unbanned_pokemon, banned_abilities, unbanned_abilities, banned_moves, unbanned_moves, banned_items, unbanned_items, inherit_bans, inherit_bans_as_unbans] = result;
		const model = new FormatsModel(
			<string>name,
			<string>slug,
			<string>about,
			<string>tournament,
			<string>type,
			<string>sim_rules,
			<string>banned_pokemon,
			<string>unbanned_pokemon,
			<string>banned_abilities,
			<string>unbanned_abilities,
			<string>banned_moves,
			<string>unbanned_moves,
			<string>banned_items,
			<string>unbanned_items,
			<string>inherit_bans,
			<string>inherit_bans_as_unbans
		);

		d.push(model);
	});

	onPopulate.dispatch([null, d]);
}

export default populate;
