import type { TypeCaster } from "src/types";

const numberTypeCaster: TypeCaster = {
	isType(plainValue, type) {
		if (type) {
			return type.toLowerCase() === "number";
		}

		if (plainValue.length === 0) {
			return false;
		}

		return !Number.isNaN(Number(plainValue));
	},
	castValue(plainValue) {
		return Number(plainValue);
	},
	typescriptType() {
		return "number";
	},
};

export default numberTypeCaster;
