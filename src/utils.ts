import { Room } from 'ts-psim-client';
import * as ts from 'typescript';

export function isLittleCup(room: Room): boolean {
	return room.name === 'littlecup';
}

export async function evalTs(code: string): Promise<string> {
	const transpiled = await ts.transpile(code);
	const result = await eval(transpiled);
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
