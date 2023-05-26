import arrayTypeCaster from "./array";
import booleanTypeCaster from "./boolean";
import numberTypeCaster from "./number";
import stringTypeCaster from "./string";

const defaultTypeCasters = {
	number: numberTypeCaster,
	boolean: booleanTypeCaster,
	string: stringTypeCaster,
	array: arrayTypeCaster,
};

export default defaultTypeCasters;
