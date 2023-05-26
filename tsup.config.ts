import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["lib/*.ts"],
	format: ["cjs", "esm"],
	splitting: true,
	sourcemap: false,
	clean: true,
	dts: true,
	skipNodeModulesBundle: true,
	minify: true,
});
