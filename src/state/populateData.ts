import { AutoNotifications, SimpleCommands } from '../database';

async function populateData(): Promise<void> {
	await AutoNotifications.populate();
	await SimpleCommands.populate();
}

export default populateData;
