import chalk from "chalk";
import { writeFileSync } from "fs";
import { resolve } from "path";
import defaultTypeCasters from "src/typeCasters";
import type {
	EnvCasterOptions,
	PlainEnv,
	TypeCasters,
	ViteUserConfig,
} from "src/types";
import {
	castToRealType,
	castValueToRealValueInString,
	getTypingType,
} from "src/utilities";
import { loadEnv } from "vite";

export class EnvCasterContext {
	config!: ViteUserConfig;
	options: EnvCasterOptions;
	private plainEnv: PlainEnv = {};

	constructor(options: EnvCasterOptions) {
		this.options = options;
	}

	loadConfig(config: ViteUserConfig) {
		const root = config.root ? config.root : process.cwd();
		const envDir = config.envDir ? resolve(root, config.envDir) : root;

		this.config = {
			...config,
			envDir,
			root,
		};
	}

	/*************  ✨ Codeium Command ⭐  *************/
	/**
	 * Load environment variables from env files.
	 * @see https://vitejs.dev/config/#envdir
	 * @see https://vitejs.dev/config/#env-prefix
	 * @see https://vitejs.dev/config/#environment-variables
	 */
	/******  aa9efc1e-c530-4ff9-8c6c-c29cd8aa6375  *******/
	loadEnv() {
		this.plainEnv = loadEnv(
			this.config.mode,
			this.config.envDir,
			this.config.envPrefix
		);
	}

	generateDeclarationFile() {
		if (Object.keys(this.plainEnv).length === 0) {
			return;
		}

		const env: PlainEnv = {};

		for (const key in this.plainEnv) {
			const newKey = this.options.transformKey
				? this.options.transformKey(key)
				: key;

			env[newKey] = this.getTypingType(this.plainEnv[key]) as never;
		}

		const content = `declare module "${this.options.moduleName}" {
  interface ENV {
    ${Object.keys(env)
			.map((key) => `${key}: ${env[key]}`)
			.join(";\n    ")};
  }

  const ${this.options.exportName}: ENV;
  export default ${this.options.exportName};
}
`;

		writeFileSync(
			resolve(
				this.config.root,
				typeof this.options.declaration === "string"
					? this.options.declaration
					: "./env.d.ts"
			),
			content
		);
	}

	loadEnvModule(): string {
		const env = this.castEnv();

		return `const ${this.options.exportName} = ${castValueToRealValueInString(
			env
		)};

export default ${this.options.exportName};
`;
	}

	castEnv() {
		const env: PlainEnv = {};

		for (const key in this.plainEnv) {
			try {
				const newKey = this.options.transformKey
					? this.options.transformKey(key)
					: key;

				env[newKey] = this.castToRealType(this.plainEnv[key]) as never;
			} catch (error) {
				if (error instanceof Error) {
					console.error(
						chalk.bold(chalk.green("[vite-env-caster]")),
						chalk.red(`Failed to cast ${chalk.bold(key)}: ${error.message}`)
					);
				} else {
					throw error;
				}
			}
		}

		return env;
	}

	castToRealType(input: string) {
		const mergedCasters: TypeCasters = {
			...defaultTypeCasters,
			...this.options.typeCasters,
		};

		return castToRealType(input, mergedCasters);
	}

	getTypingType(input: string) {
		const mergedCasters: TypeCasters = {
			...defaultTypeCasters,
			...this.options.typeCasters,
		};

		return getTypingType(input, mergedCasters);
	}
}
