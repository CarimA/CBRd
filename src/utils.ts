import { Room, Utils } from 'ts-psim-client';
import * as ts from 'typescript';

export function isLittleCup(room: Room): boolean {
	return room.name === 'littlecup';
}

export function isAuthorized(authUsers: string[], user: string): boolean {
	let input = sanitize(user);
	if (
		input.startsWith('+') ||
		input.startsWith('%') ||
		input.startsWith('@') ||
		input.startsWith('#') ||
		input.startsWith('&')
	) {
		input = input.substring(1);
	}

	return authUsers.includes(input);
}

export function sanitize(input: string): string {
	input = input.trim();
	input = input.replace(/\s/g, '');
	input = input.toLowerCase();

	return input;
}

export function checkRank(input: string, rank: string): boolean {
	if (rank === '+') {
		return Utils.isVoice(input);
	} else if (rank === '%') {
		return Utils.isDriver(input);
	} else if (rank === '@') {
		return Utils.isModerator(input);
	} else if (rank === '#') {
		return Utils.isRoomOwner(input);
	} else if (rank === '&') {
		return Utils.isAdministrator(input);
	}

	// for security, assume it won't work if the programmer mis-input a rnak.
	return false;
}

export function evalTs(code: string): string {
	const transpiled = ts.transpile(code);
	const result = eval(transpiled);
	return JSON.stringify(result);
}

export function titleCase(str: string): string {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

export function shuffleArray<T>(array: Array<T>): Array<T> {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export function random(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function mod(x: number, mod: number): number {
	return ((x % mod) + mod) % mod;
}
