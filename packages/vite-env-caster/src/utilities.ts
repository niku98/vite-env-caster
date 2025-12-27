import type { TypeCasters } from "src/types";

export function castValueToRealValueInString(value: any): string {
	switch (typeof value) {
		case "string":
			return value.includes('"') ? `'${value}'` : `"${value}"`;

		case "object":
			if (Array.isArray(value)) {
				return `[${value
					.map((val) => `${castValueToRealValueInString(val)}`)
					.join(",")}]`;
			} else if (value === null) {
				return "null";
			} else {
				return `{
  ${Object.keys(value)
		.map((key) => `${key}: ${castValueToRealValueInString(value[key])}`)
		.join(",\n  ")}
}`;
			}

		default:
			return String(value);
	}
}

export function castToRealType(
	input: string,
	casters: TypeCasters,
	extracType = true
) {
	const { value, type } = extracType
		? extractTypeAndValue(input)
		: { value: input, type: undefined };

	const caster = getSortedTypeCasters(casters).find((pair) =>
		pair.isType(value, type)
	);

	if (caster) {
		return caster.castValue(value, !!type, type, casters);
	}

	return value;
}

export function getTypingType(input: string, casters: TypeCasters) {
	const { value, type } = extractTypeAndValue(input);

	const caster = getSortedTypeCasters(casters).find((pair) =>
		pair.isType(value, type)
	);

	if (caster) {
		return caster.typescriptType
			? caster.typescriptType(value, type, casters)
			: "any";
	}

	return "string";
}

const typeRegex = /\|(([\w\d]+)(\[([\w\d,\[\]]+)\])?)$/g;
export function extractTypeAndValue(input: string) {
	let type: string | undefined = undefined;
	let value = input;

	if (typeRegex.test(input.toLowerCase())) {
		const matched = Array.from(input.match(typeRegex) || []);

		type = matched[0]?.replace(/^\|/, "");
		value = input.replace(typeRegex, "");
	}

	return { type, value };
}

export function getSortedTypeCasters(casters: TypeCasters) {
	return Object.values(casters).sort(
		(a, b) => (a.priority ?? 0) - (b.priority ?? 0)
	);
}
