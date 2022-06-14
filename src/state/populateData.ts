import { AutoNotifications, SimpleCommands, Formats, SampleTeams, Resources } from '../database';

async function populateData(): Promise<void> {
	await AutoNotifications.populate();
	await SimpleCommands.populate();
	await Formats.populate();
	await SampleTeams.populate();
	await Resources.populate();
}

export default populateData;
