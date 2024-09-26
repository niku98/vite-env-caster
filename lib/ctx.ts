import chalk from "chalk";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { loadEnv } from "vite";
import defaultTypeCasters from "./typeCasters";
import {
	EnvCasterOptions,
	PlainEnv,
	TypeCasters,
	ViteUserConfig,
} from "./types";
import {
	castToRealType,
	castValueToRealValueInString,
	getTypingType,
} from "./utilities";

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
