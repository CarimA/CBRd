import { connect } from '.';

async function retrieve(table: string, columns: number): Promise<any[][] | null | undefined> {
	const sheets = await connect();
	const repsonse = await sheets.spreadsheets.values.get({
		spreadsheetId: process.env.SHEET_ID,
		range: `'${table}'!A:${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[columns]}`
	});

	return repsonse.data.values?.slice(1);
}

export default retrieve;
