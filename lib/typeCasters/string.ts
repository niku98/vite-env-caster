import { TypeCaster } from "../types";

const stringTypeCaster: TypeCaster = {
  isType(_, type) {
    return type === "string";
  },
  castValue(plainValue) {
    return plainValue;
  },
  typescriptType() {
    return "string";
  },
};

export default stringTypeCaster;
