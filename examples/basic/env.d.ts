declare module "app-env" {
  interface ENV {
    VITE_TEST_ARRAY: (number | string[] | { abc: number; def: string[] })[];
    VITE_TEST_ARRAY_BOOLEAN: boolean[];
    VITE_TEST_ARRAY_NUMBER: number[];
    VITE_TEST_ARRAY_STRING: string[];
    VITE_TEST_BOOLEAN: boolean;
    VITE_TEST_NUMBER: number;
    VITE_TEST_OBJECT: { abc: (number | string)[]; def: string };
    VITE_TEST_STRING: string;
  }

  const appEnv: ENV;
  export default appEnv;
}
