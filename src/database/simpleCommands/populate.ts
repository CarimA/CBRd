import { retrieve } from '..';
import { data, SimpleCommandsModel, clearData, onPopulate } from '.';

async function populate(): Promise<void> {
	const results = await retrieve('Simple Commands', 6);
	if (!results) {
		return onPopulate.dispatch(['Data is empty', null]);
	}

	clearData();

	results.forEach((result) => {
		const [input, psimRooms, minimumRank, publicRank, userOverrides, output] = result;
		const model = new SimpleCommandsModel(
			(<string>input).toLowerCase(),
			(<string>psimRooms).split(',').map((room) => room.trim()),
			<string>minimumRank,
			<string>publicRank,
			(<string>userOverrides).split(',').map((user) => user.trim()),
			<string>output
		);

		data.push(model);
	});

	onPopulate.dispatch([null, data]);
}

export default populate;
