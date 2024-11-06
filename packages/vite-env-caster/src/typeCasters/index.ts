import arrayTypeCaster from "src/typeCasters/array";
import booleanTypeCaster from "src/typeCasters/boolean";
import numberTypeCaster from "src/typeCasters/number";
import stringTypeCaster from "src/typeCasters/string";

const defaultTypeCasters = {
	number: numberTypeCaster,
	boolean: booleanTypeCaster,
	string: stringTypeCaster,
	array: arrayTypeCaster,
};

export default defaultTypeCasters;
