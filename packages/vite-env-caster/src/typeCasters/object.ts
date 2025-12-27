import type { TypeCaster, TypeCasters } from "src/types";
import { getSortedTypeCasters } from "src/utilities";

const typeRegex = /^object$/i;

interface ObjectProperty {
	key: string;
	value: string;
}

function parseObjectString(plainValue: string): ObjectProperty[] {
	const objectString = plainValue.replace(/^\{|\}$/g, "").trim();
	if (!objectString) {
		return [];
	}

	const properties: ObjectProperty[] = [];
	let currentKey = "";
	let currentValue = "";
	let depth = 0;
	let inString = false;
	let stringChar = "";
	let state: "key" | "value" = "key";

	for (let i = 0; i < objectString.length; i++) {
		const char = objectString[i];
		const prevChar = i > 0 ? objectString[i - 1] : "";

		// Handle string literals
		if ((char === '"' || char === "'") && prevChar !== "\\") {
			if (!inString) {
				inString = true;
				stringChar = char;
			} else if (char === stringChar) {
				inString = false;
				stringChar = "";
			}
			if (state === "key") {
				currentKey += char;
			} else {
				currentValue += char;
			}
			continue;
		}

		// If we're inside a string, just add the character
		if (inString) {
			if (state === "key") {
				currentKey += char;
			} else {
				currentValue += char;
			}
			continue;
		}

		// Track bracket/brace depth
		if (char === "{" || char === "[") {
			depth++;
			if (state === "value") {
				currentValue += char;
			}
		} else if (char === "}" || char === "]") {
			depth--;
			if (state === "value") {
				currentValue += char;
			}
		} else if (char === ":" && state === "key" && depth === 0) {
			// Transition from key to value
			state = "value";
		} else if (char === "," && state === "value" && depth === 0) {
			// End of property
			properties.push({
				key: currentKey.trim().replace(/^["']|["']$/g, ""),
				value: currentValue.trim(),
			});
			currentKey = "";
			currentValue = "";
			state = "key";
		} else {
			if (state === "key") {
				currentKey += char;
			} else {
				currentValue += char;
			}
		}
	}

	// Add the last property if there's any remaining
	if (currentKey.trim() && currentValue.trim()) {
		properties.push({
			key: currentKey.trim().replace(/^["']|["']$/g, ""),
			value: currentValue.trim(),
		});
	}

	return properties;
}

function getObjectTypeScriptType(
	plainValue: string,
	allCasters: TypeCasters
): string {
	const properties = parseObjectString(plainValue);
	const sortedTypeCasters = getSortedTypeCasters(allCasters);

	const typeProperties = properties.map((prop) => {
		const trimmedValue = prop.value.trim();

		const matchedCaster = sortedTypeCasters.find((caster) => {
			if (!caster.typescriptType) {
				return true;
			}
			return caster.isType(trimmedValue);
		});

		const propType = matchedCaster?.typescriptType
			? matchedCaster.typescriptType(trimmedValue, undefined, allCasters)
			: "string";

		return `${prop.key}: ${propType}`;
	});

	return `{ ${typeProperties.join("; ")} }`;
}

const objectTypeCaster: TypeCaster = {
	priority: 4,
	isType(plainValue, type) {
		if (type) {
			return typeRegex.test(type);
		}

		// Check if it's a valid JSON object structure
		const trimmed = plainValue.trim();
		if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
			return false;
		}

		// Basic validation: check if braces are balanced
		let depth = 0;
		let inString = false;
		let stringChar = "";

		for (let i = 0; i < trimmed.length; i++) {
			const char = trimmed[i];
			const prevChar = i > 0 ? trimmed[i - 1] : "";

			if ((char === '"' || char === "'") && prevChar !== "\\") {
				if (!inString) {
					inString = true;
					stringChar = char;
				} else if (char === stringChar) {
					inString = false;
					stringChar = "";
				}
				continue;
			}

			if (inString) {
				continue;
			}

			if (char === "{" || char === "[") {
				depth++;
			} else if (char === "}" || char === "]") {
				depth--;
				if (depth < 0) {
					return false;
				}
			}
		}

		return depth === 0;
	},
	castValue(plainValue, _, _type, allCasters) {
		const properties = parseObjectString(plainValue);
		const sortedTypeCasters = getSortedTypeCasters(allCasters);
		const result: Record<string, any> = {};

		for (const prop of properties) {
			const trimmedValue = prop.value.trim();

			const matchedCaster = sortedTypeCasters.find((caster) => {
				if (!caster.typescriptType) {
					return true;
				}
				return caster.isType(trimmedValue);
			});

			if (matchedCaster) {
				result[prop.key] = matchedCaster.castValue(
					trimmedValue,
					false,
					undefined,
					allCasters
				);
			} else {
				// Fallback to string - find string caster by checking if it returns "string" type
				const stringCaster = sortedTypeCasters.find(
					(c) =>
						c.typescriptType?.(trimmedValue, undefined, allCasters) === "string"
				);
				if (stringCaster) {
					result[prop.key] = stringCaster.castValue(
						trimmedValue,
						false,
						undefined,
						allCasters
					);
				} else {
					result[prop.key] = trimmedValue;
				}
			}
		}

		return result;
	},
	typescriptType(plainValue, _, allCasters) {
		// Always infer types from value
		return getObjectTypeScriptType(plainValue, allCasters);
	},
};

export default objectTypeCaster;
