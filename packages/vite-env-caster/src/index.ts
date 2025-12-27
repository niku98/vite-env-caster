import { EnvCasterContext } from "src/ctx";
import type { EnvCasterOptions } from "src/types";
import type { Plugin } from "vite";
export { default as defaultTypeCasters } from "./typeCasters";

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
