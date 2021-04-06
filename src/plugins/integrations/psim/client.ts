import { Client } from 'ts-psim-client';

const psim = new Client({ debug: true });
psim.connect();

export const client = psim;
