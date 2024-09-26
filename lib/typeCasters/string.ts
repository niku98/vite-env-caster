import { TypeCaster } from "../types";
import { getStringValue } from "./string.utils";

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
