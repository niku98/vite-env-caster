import { TypeCaster } from "../types";

const typeRegex = /array(\[([\w\d]+)\])?/;
const valueRegex = /^\[(((.*?),(\s+)?)+)(.*?)*\]$/;

const arrayTypeCaster: TypeCaster = {
	isType(plainValue, type) {
		if (type) {
			const result = typeRegex.test(type.toLowerCase());
			return result;
		}

		return valueRegex.test(plainValue);
	},
	castValue(plainValue, _, type) {
		const matched = type?.toLowerCase()?.match(typeRegex);
		const itemType = matched?.[2];

		const arrayString = plainValue.replace(/^\[(.*?)\]$/, "$1");
		const array = arrayString.split(",");

		return array.map((value) => {
			const trimValue = value.trim();
			switch (itemType) {
				case "number":
					return Number(trimValue);
				case "string":
					return trimValue;
				default:
					return Number.isNaN(Number(trimValue))
						? trimValue
						: Number(trimValue);
			}
		});
	},
	typescriptType(_, type) {
		const matched = type?.toLowerCase()?.match(typeRegex);
		const itemType = matched?.[2];

		return itemType ? `${itemType}[]` : "(string | number)[]";
	},
};

export default arrayTypeCaster;
