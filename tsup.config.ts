import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["lib/index.ts"],
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
	minify: false,
	treeshake: true,
	external: ["vite", "chalk"],
});
