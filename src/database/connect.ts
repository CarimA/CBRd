import { google } from 'googleapis';
import { writeFile, unlink } from 'fs';
import { promisify } from 'util';

async function connect() {
	const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary');
	const writeFileAsync = promisify(writeFile);
	const unlinkAsync = promisify(unlink);

	const secrets = decode(process.env['GOOGLE_SECRETS'] || '').replace(/\\n/g, '\\n');
	await writeFileAsync('./temp-secrets.json', secrets);

	process.env['GOOGLE_APPLICATION_CREDENTIALS'] = './temp-secrets.json';
	const auth = await google.auth.getClient({
		scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
	});

	await unlinkAsync('./temp-secrets.json');

	const sheets = google.sheets({
		version: 'v4',
		auth
	});

	return sheets;
}

export default connect;
