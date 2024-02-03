import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["lib/*.ts"],
	format: ["cjs", "esm"],
	outExtension(ctx) {
		return {
			js: ctx.format === "esm" ? ".mjs" : ".cjs",
		};
	},
	splitting: true,
	sourcemap: false,
	clean: true,
	dts: true,
	skipNodeModulesBundle: true,
	minify: true,
	treeshake: true,
});
