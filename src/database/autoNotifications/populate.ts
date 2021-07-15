import { retrieve } from '..';
import { data, AutoNotificationModel, clearData } from '.';
import onPopulate from './onPopulate';

async function populate(): Promise<void> {
	const results = await retrieve('Auto Notificaitons', 4);
	if (!results) {
		return onPopulate.dispatch(['Data is empty', null]);
	}

	clearData();

	results.forEach((result) => {
		const [message, psimRoom, minimumWait, minimumMessages] = result;
		const model = new AutoNotificationModel(
			<string>message,
			<string>psimRoom,
			<number>minimumWait,
			<number>minimumMessages
		);

		data.push(model);
	});

	onPopulate.dispatch([null, data]);
}

export default populate;
