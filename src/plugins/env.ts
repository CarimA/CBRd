import dotenv from 'dotenv';

// assign types to expected env vars
// todo: remove non-secrets and place in own plugins
declare let process: {
	env: {
		PORT: number;
		PSIM_USERNAME: string;
		PSIM_PASSWORD: string;
		PSIM_AVATAR: string;
		PSIM_AUTO_JOIN_ROOMS: string;
		PSIM_TOUR_ROOM: string;
		DISCORD_TOKEN: string;
		DISCORD_SERVER_ID: string;
		DISCORD_ANNOUNCE_CHANNEL: string;
		DISCORD_TOURS_CHANNEL: string;
	};
};

dotenv.config();

export const env = process.env;
