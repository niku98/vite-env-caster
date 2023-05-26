import { defineConfig } from "vite";
import EnvCaster from "./lib";

export default defineConfig({
	plugins: [EnvCaster()],
});
