import Module from '../module';
import modules from './modules';

function removeModules<T extends Module>(typeT: new (...params: any[]) => T): ({ count: number } | null)[] {
	const beforeCount = modules.length;

	for (let l = modules.length - 1; l >= 0; l -= 1) {
		if (modules[l] instanceof typeT) {
			modules.splice(l, 1);
		}
	}

	const afterCount = modules.length;

	return [
		null,
		{
			count: beforeCount - afterCount
		}
	];
}

export default removeModules;
