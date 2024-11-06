import EnvCaster from "@niku/vite-env-caster";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		EnvCaster({
			transformKey(key) {
				return key
					.replace("VITE_", "")
					.split("_")
					.map((word) => word.toLowerCase())
					.map((word, index) =>
						index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
					)
					.join("");
			},
		}),
	],
});
