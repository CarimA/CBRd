import { google } from 'googleapis';
import { writeFile } from 'fs';
import { promisify } from 'util';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function connect() {
	const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary');
	const writeFileAsync = promisify(writeFile);

	const secrets = decode(process.env['GOOGLE_SECRETS'] || '').replace(/\\n/g, '\\n');
	await writeFileAsync('./temp-secrets.json', secrets);

	process.env['GOOGLE_APPLICATION_CREDENTIALS'] = './temp-secrets.json';
	const auth = await google.auth.getClient({
		scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
	});

	const sheets = google.sheets({
		version: 'v4',
		auth
	});

	return sheets;
}

export default connect;
