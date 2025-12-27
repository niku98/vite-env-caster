import chalk from "chalk";
import type { TypeCaster, TypeCasters } from "src/types";
import { getSortedTypeCasters } from "src/utilities";

const typeRegex = /array(\[([\w\d,\[\]]+)\])?/;
const valueRegex = /^\[(((.*?),?(\s+)?)+)(.*?)*\]$/;

type ArrayItemType = string;

function getItemsFromPlainValue(plainValue: string) {
	const arrayString = plainValue.replace(/^\[(.*?)\]$/, "$1");
	const items: string[] = [];
	let currentItem = "";
	let depth = 0;
	let inString = false;
	let stringChar = "";

	for (let i = 0; i < arrayString.length; i++) {
		const char = arrayString[i];
		const prevChar = i > 0 ? arrayString[i - 1] : "";

		// Handle string literals
		if ((char === '"' || char === "'") && prevChar !== "\\") {
			if (!inString) {
				inString = true;
				stringChar = char;
			} else if (char === stringChar) {
				inString = false;
				stringChar = "";
			}
			currentItem += char;
			continue;
		}

		// If we're inside a string, just add the character
		if (inString) {
			currentItem += char;
			continue;
		}

		// Track bracket/brace depth
		if (char === "{" || char === "[") {
			depth++;
			currentItem += char;
		} else if (char === "}" || char === "]") {
			depth--;
			currentItem += char;
		} else if (char === "," && depth === 0) {
			// Only split on comma when we're at top level
			items.push(currentItem.trim());
			currentItem = "";
		} else {
			currentItem += char;
		}
	}

	// Add the last item if there's any remaining
	if (currentItem.trim()) {
		items.push(currentItem.trim());
	}

	return items;
}

function getArrayItemTypesFromValue(
	plainValue: string,
	otherCasters: TypeCasters
): ArrayItemType[] {
	const items = getItemsFromPlainValue(plainValue);
	const typesSet = items.reduce<Set<ArrayItemType>>((types, item) => {
		const trimmedValue = item.trim();

		const matchedCaster = getSortedTypeCasters(otherCasters).find((caster) => {
			if (!caster.typescriptType) {
				return true;
			}

			return caster.isType(trimmedValue);
		});

		if (matchedCaster) {
			types.add(
				matchedCaster.typescriptType
					? matchedCaster.typescriptType(trimmedValue, undefined, otherCasters)
					: "any"
			);
		} else {
			types.add("string");
		}

		return types;
	}, new Set<ArrayItemType>());

	return Array.from(typesSet);
}

function getArrayItemTypesFromType(type: string): ArrayItemType[] {
	const matched = type?.toLowerCase()?.match(typeRegex);
	if (matched?.[2]) {
		const itemType = matched[2];
		const types: string[] = [];
		let currentType = "";
		let depth = 0;

		for (let i = 0; i < itemType.length; i++) {
			const char = itemType[i];

			if (char === "[") {
				depth++;
				currentType += char;
			} else if (char === "]") {
				depth--;
				currentType += char;
			} else if (char === "," && depth === 0) {
				// Only split on comma when we're at top level
				types.push(currentType.trim());
				currentType = "";
			} else {
				currentType += char;
			}
		}

		// Add the last type if there's any remaining
		if (currentType.trim()) {
			types.push(currentType.trim());
		}

		return types;
	}

	return [];
}

function convertTypeStringToTsType(
	typeString: string,
	allCasters: TypeCasters
): string {
	// Check if it's a nested array type like "array[string]"
	const nestedArrayMatch = typeString.toLowerCase().match(/^array\[(.+)\]$/);
	if (nestedArrayMatch) {
		// Recursively parse the inner types
		const innerTypeString = nestedArrayMatch[1];
		const innerTypes = getArrayItemTypesFromType(`array[${innerTypeString}]`);

		// Convert each inner type recursively
		const convertedInnerTypes = innerTypes.map((t) =>
			convertTypeStringToTsType(t, allCasters)
		);

		// Join and wrap with []
		if (convertedInnerTypes.length > 1) {
			return `(${convertedInnerTypes.join(" | ")})[]`;
		}
		return `${convertedInnerTypes[0]}[]`;
	}

	// For primitive types, return as-is
	return typeString;
}

function joinTypesAsTsType(types: ArrayItemType[], allCasters?: TypeCasters) {
	const convertedTypes = allCasters
		? types.map((t) => convertTypeStringToTsType(t, allCasters))
		: types;

	if (convertedTypes.length > 1) {
		return `(${convertedTypes.join(" | ")})[]`;
	}

	return `${convertedTypes[0]}[]`;
}

const arrayTypeCaster: TypeCaster = {
	priority: 3,
	isType(plainValue, type) {
		if (type) {
			const typeMatches = typeRegex.test(type.toLowerCase());
			if (!typeMatches) {
				return false;
			}
			// Also verify the value is actually an array
			return valueRegex.test(plainValue);
		}

		return valueRegex.test(plainValue);
	},
	castValue(plainValue, _, type, allCasters) {
		const itemTypes = type ? getArrayItemTypesFromType(type) : [];
		const emptyType = itemTypes.length === 0;

		const array = getItemsFromPlainValue(plainValue);
		const sortedTypeCasters = getSortedTypeCasters(allCasters);

		return array.map((value) => {
			const trimValue = value.trim();

			// Find the matching item type and caster for this value
			let matchedCaster: TypeCaster | undefined;
			let matchingItemType: string | undefined;

			// Special case: if we have a single forced type, use it directly
			if (!emptyType && itemTypes.length === 1) {
				const itemType = itemTypes[0];
				const isNestedArrayType = itemType.toLowerCase().startsWith("array[");

				// Find the caster for this type
				const caster = sortedTypeCasters.find((c) => {
					return c.isType(trimValue, itemType);
				});

				// For nested arrays, verify the value is actually an array structure
				if (caster) {
					if (isNestedArrayType && !valueRegex.test(trimValue)) {
						// Value is not an array, can't use array caster
					} else {
						matchedCaster = caster;
						matchingItemType = itemType;
					}
				}

				// If we found a caster, use it with force=true
				if (matchedCaster) {
					return matchedCaster.castValue(
						trimValue,
						true, // Force the type conversion
						matchingItemType,
						allCasters
					);
				}
			}

			// Prioritize array types first if the value looks like an array
			const isArrayValue = valueRegex.test(trimValue);
			const sortedItemTypes = isArrayValue
				? [...itemTypes].sort((a, b) => {
						const aIsArray = a.toLowerCase().startsWith("array[");
						const bIsArray = b.toLowerCase().startsWith("array[");
						if (aIsArray && !bIsArray) return -1;
						if (!aIsArray && bIsArray) return 1;
						return 0;
				  })
				: itemTypes;

			for (const itemType of sortedItemTypes) {
				// Find casters that match this item type
				const potentialCasters = sortedTypeCasters.filter((c) => {
					if (!c.typescriptType && emptyType) {
						return true;
					}
					// Check if the caster recognizes this type
					return c.isType(trimValue, itemType);
				});

				// For each potential caster, verify it can actually handle this value
				for (const caster of potentialCasters) {
					const isNestedArrayType = itemType.toLowerCase().startsWith("array[");

					// When we have a forced type (non-empty itemTypes), we should allow casting
					// even if the value doesn't naturally match, because the force parameter will handle it.
					// Only do strict value checking when we don't have a forced type.
					if (!emptyType) {
						// For nested arrays, verify the value is actually an array structure
						if (isNestedArrayType && !valueRegex.test(trimValue)) {
							continue;
						}
						// For non-nested types with forced type, skip strict value check
						// The force parameter will handle the conversion
						// Only check value match when we don't have a forced type (emptyType case)
					} else {
						// When no type is forced, verify the value actually matches
						if (!isNestedArrayType && !caster.isType(trimValue)) {
							continue;
						}
					}

					// Verify the TypeScript type matches if we have a type constraint
					if (!emptyType && caster.typescriptType) {
						const tsType = caster.typescriptType(
							trimValue,
							itemType,
							allCasters
						);
						// For nested arrays, get the expected TypeScript type
						const expectedType = isNestedArrayType
							? convertTypeStringToTsType(itemType, allCasters)
							: itemType;

						if (tsType === expectedType) {
							matchedCaster = caster;
							matchingItemType = itemType;
							break;
						}
					} else {
						matchedCaster = caster;
						matchingItemType = itemType;
						break;
					}
				}

				if (matchedCaster) {
					break;
				}
			}

			// Fallback: try to find any matching caster if no type constraints
			if (!matchedCaster && emptyType) {
				matchedCaster = sortedTypeCasters.find((c) => c.isType(trimValue));
			}

			if (matchedCaster) {
				// For nested array types, ensure we pass the full type string
				const typeToUse = matchingItemType || undefined;
				return matchedCaster.castValue(
					trimValue,
					!emptyType,
					typeToUse,
					allCasters
				);
			}

			throw new Error(
				`Item with value ${chalk.bold(
					value
				)} is not assign to type ${chalk.bold(itemTypes.join(" | "))}`
			);
		});
	},
	typescriptType(plainValue, type, allCasters) {
		if (type) {
			return joinTypesAsTsType(getArrayItemTypesFromType(type), allCasters);
		}

		return joinTypesAsTsType(
			getArrayItemTypesFromValue(plainValue, allCasters),
			allCasters
		);
	},
};

export default arrayTypeCaster;
