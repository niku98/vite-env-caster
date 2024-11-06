import { getStringValue } from "src/typeCasters/string.utils";
import type { TypeCaster } from "src/types";

const stringTypeCaster: TypeCaster = {
	isType(_, type) {
		return type === "string";
	},
	castValue(plainValue) {
		return getStringValue(plainValue);
	},
	typescriptType() {
		return "string";
	},
};

export default stringTypeCaster;
