import { retrieve } from '..';
import { data as d, ResourcesModel, clearData, onPopulate } from '.';

async function populate(): Promise<void> {
	const results = await retrieve('Resources', 3);
	if (!results) {
		return onPopulate.dispatch(['Data is empty', null]);
	}

	clearData();

	results.forEach((result) => {
		const [formats, name, url] = result;
		const model = new ResourcesModel(
			<string>formats,
			<string>name,
			<string>url
		);

		d.push(model);
	});

	onPopulate.dispatch([null, d]);
}

export default populate;
