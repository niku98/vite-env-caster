import type { Plugin } from "vite";
import { EnvCasterContext } from "./ctx";
import { EnvCasterOptions } from "./types";

function EnvCaster(options?: EnvCasterOptions): Plugin[] {
	const mergedOptions: EnvCasterOptions = {
		moduleName: "app-env",
		exportName: "appEnv",
		declaration: "./env.d.ts",
		...options,
	};

	const ctx = new EnvCasterContext(mergedOptions);
	const virtualModule = "real_" + mergedOptions.moduleName;

	return [
		{
			name: "vite-env-caster",
			configResolved(config) {
				ctx.loadConfig(config);
				ctx.loadEnv();
				if (mergedOptions.declaration !== false) {
					ctx.generateDeclarationFile();
				}
			},
			resolveId(id) {
				if (id === mergedOptions.moduleName) {
					return virtualModule;
				}

				return;
			},
			load(id) {
				if (id === virtualModule) {
					return ctx.loadEnvModule();
				}

				return;
			},
		},
	];
}

export default EnvCaster;
