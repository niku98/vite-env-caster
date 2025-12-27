import { getStringValue } from "src/typeCasters/string.utils";
import type { TypeCaster } from "src/types";

const stringTypeCaster: TypeCaster = {
	priority: Number.MAX_SAFE_INTEGER, // String should be a fallback type
	isType() {
		return true;
	},
	castValue(plainValue) {
		return getStringValue(plainValue);
	},
	typescriptType() {
		return "string";
	},
};

export default stringTypeCaster;
