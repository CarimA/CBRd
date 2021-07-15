import { AutoNotifications, SimpleCommands } from '../database';
import AutoNotificationModule from '../modules/autoNotificationModule';
import SimpleCommandModule from '../modules/simpleCommandModule';
import modules from './modules';
import removeModules from './removeModules';

function subscribe(): void {
	AutoNotifications.onPopulate.subscribe(([err, data]) => {
		if (err) {
			console.error(err);
		} else {
			console.log(data);

			const [err, results] = removeModules(AutoNotificationModule);
			if (!results) {
				console.error('Could not deregister modules');
				console.error(err);
			} else {
				console.log(`Removed ${results.count} module(s)`);
				(<AutoNotifications.AutoNotificationModel[]>data).forEach((autoNotification) => {
					modules.push(new AutoNotificationModule(autoNotification));
				});
			}
		}
	});

	SimpleCommands.onPopulate.subscribe(([err, data]) => {
		if (err) {
			console.error(err);
		} else {
			console.log(data);

			const [err, results] = removeModules(SimpleCommandModule);
			if (!results) {
				console.error('Could not deregister modules');
				console.error(err);
			} else {
				console.log(`Removed ${results.count} module(s)`);
				(<SimpleCommands.SimpleCommandsModel[]>data).forEach((simpleCommand) => {
					modules.push(new SimpleCommandModule(simpleCommand));
				});
			}
		}
	});
}

export default subscribe;
