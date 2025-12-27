import type defaultTypeCasters from "src/typeCasters";
import type { ResolvedConfig } from "vite";

export interface EnvCasterOptions {
	/**
	 * Module name to load env from
	 * @example import env from "app-env";
	 * @default "app-env"
	 */
	moduleName?: string;

	/**
	 * Exported name from virtual module
	 * @example export default appEnv;
	 * @default "appEnv"
	 */
	exportName?: string;

	/**
	 * Declaration destination path
	 * @default "./env.d.ts"
	 */
	declaration?: false | string;

	typeCasters?: TypeCasters &
		Partial<Record<keyof typeof defaultTypeCasters, TypeCaster>>;

	/**
	 * Transform env key
	 * @default undefined
	 */
	transformKey?: (plainKey: string) => string;
}

export interface ViteUserConfig extends ResolvedConfig {}

export type PlainEnv = Record<string, any>;

export type TypeCasters = {
	[key: string]: TypeCaster;
};

export interface TypeCaster {
	/**
	 * Priority of type caster.
	 * Lower number means higher priority.
	 */
	priority?: number;
	/**
	 * Check if value is target type
	 * @param plainValue Plain value from env file
	 * @param type Target type got from env file @example Type will be 'string'. ENV_KEY=abc|string
	 */
	isType: (plainValue: string, type?: string) => boolean;
	/**
	 * Cast plain value from env file to javascript type
	 * @param plainValue Plain value from env file
	 * @param type Target type got from env file @example Type will be 'string'. ENV_KEY=abc|string
	 */
	castValue: (
		plainValue: string,
		force: boolean,
		type: string | undefined,
		allCasters: TypeCasters
	) => any;
	/**
	 * Typing current type
	 * @param plainValue Plain value from env file
	 * @param type Target type got from env file @example Type will be 'string'. ENV_KEY=abc|string
	 */
	typescriptType?: (
		plainValue: string,
		type: string | undefined,
		allCasters: TypeCasters
	) => string;
}
