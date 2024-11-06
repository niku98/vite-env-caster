import chalk from "chalk";
import { getStringValue, stringRegex } from "src/typeCasters/string.utils";
import type { TypeCaster } from "src/types";

const typeRegex = /array(\[([\w\d,]+)\])?/;
const valueRegex = /^\[(((.*?),(\s+)?)+)(.*?)*\]$/;

type ArrayItemType = "string" | "number" | "boolean";

function getItemsFromPlainValue(plainValue: string) {
	const arrayString = plainValue.replace(/^\[(.*?)\]$/, "$1");
	return arrayString.split(",");
}

function getArrayItemTypesFromValue(plainValue: string): ArrayItemType[] {
	const items = getItemsFromPlainValue(plainValue);
	const hasNumberValues = items.some((item) => !isNaN(Number(item)));
	const hasBooleanValues = items.some(
		(item) =>
			item.toLowerCase().trim() === "true" ||
			item.toLowerCase().trim() === "false"
	);
	const hasStringValues = items.some(
		(item) =>
			stringRegex.test(item) ||
			(isNaN(Number(item)) &&
				item.toLowerCase() !== "true" &&
				item.toLowerCase() !== "false")
	);

	const itemTypes: ArrayItemType[] = [];
	if (hasNumberValues) {
		itemTypes.push("number");
	}
	if (hasBooleanValues) {
		itemTypes.push("boolean");
	}
	if (hasStringValues) {
		itemTypes.push("string");
	}

	return itemTypes;
}

function getArrayItemTypesFromType(type: string): ArrayItemType[] {
	const matched = type?.toLowerCase()?.match(typeRegex);
	if (matched?.[2]) {
		const itemType = matched[2];
		const types = itemType.split(",");
		return types
			.map((type) => type.trim())
			.filter((type) => {
				return ["string", "number", "boolean"].includes(type.toLowerCase());
			}) as ArrayItemType[];
	}

	return [];
}

function joinTypesAsTsType(types: ArrayItemType[]) {
	if (types.length > 1) {
		return `(${types.join(" | ")})[]`;
	}

	return `${types[0]}[]`;
}

const arrayTypeCaster: TypeCaster = {
	isType(plainValue, type) {
		if (type) {
			const result = typeRegex.test(type.toLowerCase());
			return result;
		}

		return valueRegex.test(plainValue);
	},
	castValue(plainValue, _, type) {
		const itemTypes = type ? getArrayItemTypesFromType(type) : [];
		const emptyType = itemTypes.length === 0;

		const array = getItemsFromPlainValue(plainValue);

		return array.map((value) => {
			const trimValue = value.trim();
			const hasTypeNumber = itemTypes.includes("number") || emptyType;
			const hasTypeBoolean = itemTypes.includes("boolean") || emptyType;
			const hasTypeString = itemTypes.includes("string") || emptyType;

			if (hasTypeNumber) {
				if (!isNaN(Number(trimValue))) {
					return Number(trimValue);
				}

				if (itemTypes.length === 1) {
					return Number(trimValue);
				}
			}

			if (hasTypeBoolean) {
				if (
					trimValue.toLowerCase() === "true" ||
					trimValue.toLowerCase() === "false"
				) {
					return trimValue.toLowerCase() === "true";
				}

				const numValue = Number(trimValue);

				if (itemTypes.length === 1) {
					return Boolean(!isNaN(numValue) ? numValue : trimValue);
				}

				if (!isNaN(numValue) && itemTypes.length > 1) {
					return Boolean(numValue);
				}
			}

			if (hasTypeString) {
				return getStringValue(trimValue);
			}

			throw new Error(
				`Item with value ${chalk.bold(
					value
				)} is not assign to type ${chalk.bold(itemTypes.join(" | "))}`
			);
		});
	},
	typescriptType(plainValue, type) {
		if (type) {
			return joinTypesAsTsType(getArrayItemTypesFromType(type));
		}

		return joinTypesAsTsType(getArrayItemTypesFromValue(plainValue));
	},
};

export default arrayTypeCaster;
