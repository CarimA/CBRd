import { data } from '.';

function clearData(): void {
	while (data.length) {
		data.pop();
	}
}

export default clearData;
