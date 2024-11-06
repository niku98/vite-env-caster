export const stringRegex = /('(.*)')|("(.*)")/;

export function getStringValue(value: string) {
	const matched = value.match(stringRegex);
	return matched?.[2] ?? matched?.[2] ?? value;
}
