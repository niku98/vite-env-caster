import EnvCaster from "@niku/vite-env-caster";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [EnvCaster()],
});
