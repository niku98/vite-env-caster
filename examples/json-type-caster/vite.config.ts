import EnvCaster from "@niku/vite-env-caster";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		EnvCaster({
			typeCasters: {
				json: {
					typescriptType() {
						return "Record<string, unknown>";
					},
					isType(plainValue) {
						try {
							return JSON.parse(plainValue);
						} catch {
							return false;
						}
					},
					castValue(plainValue) {
						return JSON.parse(plainValue);
					},
				},
			},
		}),
	],
});
