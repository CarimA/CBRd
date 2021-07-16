import { Client } from 'discord.js';

let client: Client | undefined = undefined;

function discordClient(): Client {
	if (!client) {
		client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });
		client.login(process.env['DISCORD_TOKEN']);
	}

	return client;
}

export default discordClient;
