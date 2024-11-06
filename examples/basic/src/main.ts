import appEnv from "app-env";
import { setupCounter } from "./counter";
import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";

console.log("Casted Env", appEnv);

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript + Vite Env Caster</h1>
    <p class="read-the-docs">
      Open the developer console to inspect the environment variables
    </p>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
