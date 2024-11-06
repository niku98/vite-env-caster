import type { TypeCaster } from "src/types";

const booleanTypeCaster: TypeCaster = {
	isType(plainValue, type) {
		if (type) {
			const lowerType = type.toLowerCase();
			return lowerType === "boolean" || lowerType === "bool";
		}

		const lowerPlainValue = plainValue.toLowerCase();

		return lowerPlainValue === "false" || lowerPlainValue === "true";
	},
	castValue(plainValue, force) {
		const lowerPlainValue = plainValue.toLowerCase();
		if (force) {
			if (lowerPlainValue === "true" || lowerPlainValue === "false") {
				return lowerPlainValue === "true";
			}

			return Boolean(plainValue);
		}

		return lowerPlainValue === "true";
	},
	typescriptType() {
		return "boolean";
	},
};

export default booleanTypeCaster;
