import { Client } from 'ts-psim-client';

let client: Client | undefined = undefined;

function psimClient(): Client {
	if (!client) {
		client = new Client({ 
			debug: true,
			server: 'sim3.psim.us',
			port: 443
		});
		client.connect();
	}

	return client;
}

export default psimClient;
