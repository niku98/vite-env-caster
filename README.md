# Env Caster

Casting your **Environment Variables** to **real javascript's type**.

<p>
	<a href="https://www.npmjs.com/package/@niku/vite-env-caster" target="_blank">
		<img src="https://img.shields.io/npm/v/@niku/vite-env-caster.svg?label=&color=18C75B">
	</a>
	<a href="https://npm-stat.com/charts.html?package=@niku/vite-env-caster" target="_blank">
		<img src="https://img.shields.io/npm/dm/@niku/vite-env-caster.svg?label=&color=F09E18">
	</a>
</p>
<br>

## ✨ Features

⚡️ **Fast:** Everything is processed at build-time, zero run-time's code, your application has been no impacted.

🛠️ **Simple:** Starting use your environment variables with no configuration.

🔌 **Customizable:** Adding your custom caster or replacing default's caster.

Ts **Typescript:** Typescript supported.

<br>
<br>
<br>


## Getting started

### Installation

With yarn

```sh
yarn add @niku/vite-env-caster
```

With npm

```sh
npm i --save @niku/vite-env-caster
```

Then add `EnvCaster` to you Vite's plugins.

```ts
// vite.config.ts
import EnvCaster from '@niku/vite-env-caster';

export default defineConfig({
  plugins: [
    EnvCaster({ /* options */ }),
  ],
})
```

## Usage

It's very simple.

**Example:**

You have file `.env` like this:

```env
// .env.development
VITE_API_URL=http://example.com
VITE_DEFAULT_PAGE_SIZE=10
VITE_AUTH_ENABLED=false
VITE_ARRAY_EXAMPLE=[123,abc,def,456]
```

Then, you can import and use it's variables by import as a module.

```ts
// src/main.ts
import appEnv from "app-env";

console.log(appEnv.VITE_API_URL) // "http://example.com"
console.log(appEnv.VITE_DEFAULT_PAGE_SIZE) // 10
console.log(appEnv.VITE_AUTH_ENABLED) // false
console.log(appEnv.VITE_ARRAY_EXAMPLE) // [123, "abc", "def", 456]
```

### Force cast to type

If you need to cast **environment variable** to a static type, you can define that type in variable.

**Example:**

```env
// .env.development
VITE_IS_A_NUMBER_IN_STRING=10|string
VITE_IS_A_BOOLEAN_IN_STRING=false|string
VITE_IS_ARRAY_OF_NUMBER=[123,abc,def,456]|array[number]
VITE_IS_ARRAY_OF_STRING=[123,abc,def,456]|array[string]
```

Then.


```ts
// src/main.ts
import appEnv from "app-env";

console.log(appEnv.VITE_IS_A_NUMBER_IN_STRING) // "10"
console.log(appEnv.VITE_IS_A_BOOLEAN_IN_STRING) // "false"
console.log(appEnv.VITE_IS_ARRAY_OF_NUMBER) // [123, NaN, NaN, 456]
console.log(appEnv.VITE_IS_ARRAY_OF_STRING) // ["123", "abc", "def", "456"]
```

### Limitation

By default, this plugin only supports these 4 types: `boolean`, `string`, `number`, `(number | string)[]`.

If you need to cast others type, try to add your custom caster.

## Typescript support

By default, file `env.d.ts` will be generated at root of project. You can include it in your `tsconfig.json`.

```json
// tsconfig.json
{
	"include": ["env.d.ts", ...]
}
```

## Configuration

### Transform key

In some case, you may want to use **environment variable** with other convention. Like use with *camel case* and remove prefix `VITE_`. You can customize it very easy.

```ts
// vite.config.ts
import EnvCaster from '@niku/vite-env-caster';
import {camelCase} from "lodash";

export default defineConfig({
  plugins: [
    EnvCaster({
			transformKey: (plainKey) => camelCase(plainKey).replace("VITE_", "")
		}),
  ],
})
```

Then, you can use **environment variable** in *camel case*.

```ts
// src/main.ts
import appEnv from "app-env";

console.log(appEnv.apiUrl) // "http://example.com"
console.log(appEnv.defaultPageSize) // 10
console.log(appEnv.authEnabled) // false
console.log(appEnv.arrayExample) // [123, "abc", "def", 456]
```

### Custom Type Caster

This is an example for number caster.

```ts
// vite.config.ts
import EnvCaster from '@niku/vite-env-caster';
import {camelCase} from "lodash";

export default defineConfig({
  plugins: [
    EnvCaster({
			typeCasters: {
				number: {
					// Check if variable is number
					isType(plainValue, type) {
				    if (type) { // Forced type
				      return type.toLowerCase() === "number";
				    }

						// Auto detect
				    return !Number.isNaN(Number(plainValue));
				  },
					// Cast variable to number
				  castValue(plainValue) {
				    return Number(plainValue);
				  },
					// Type in declaration file
				  typescriptType() {
				    return "number";
				  },
				}
			},
		}),
  ],
})
```

### All options

| Option       | Description                                                              | Default    |
| ------------ | ------------------------------------------------------------------------ | ---------- |
| moduleName   | Virtual module name you will import `env` from.                          | "app-env"  |
| exportName   | Export module name will be generated in declaration file.                | "appEnv"   |
| declaration  | Should plugin generate declaration file. Can be passed a string as path. | "env.d.ts" |
| typeCasters  | List custom type casters.                                                | No         |
| transformKey | A function to transform environment variable's key.                      | No         |
