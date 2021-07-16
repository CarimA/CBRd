import { Client } from 'ts-psim-client';

let client: Client | undefined = undefined;

function psimClient(): Client {
	if (!client) {
		client = new Client({ debug: true });
		client.connect();
	}

	return client;
}

export default psimClient;
