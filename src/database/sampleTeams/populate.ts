import { retrieve } from '..';
import { data as d, SampleTeamsModel, clearData, onPopulate } from '.';

async function populate(): Promise<void> {
	const results = await retrieve('Sample Teams', 2);
	if (!results) {
		return onPopulate.dispatch(['Data is empty', null]);
	}

	clearData();

	results.forEach((result) => {
		const [formats, url] = result;
		const model = new SampleTeamsModel(
			<string>formats,
			<string>url
		);

		d.push(model);
	});

	onPopulate.dispatch([null, d]);
}

export default populate;
