declare module "app-env" {
  interface ENV {
    VITE_TEST_STRING: string;
    VITE_TEST_NUMBER: number;
    VITE_TEST_BOOLEAN: boolean;
    VITE_TEST_ARRAY: (number | boolean | string)[];
    VITE_TEST_ARRAY_STRING: string[];
    VITE_TEST_ARRAY_NUMBER: number[];
    VITE_TEST_ARRAY_BOOLEAN: boolean[];
  }

  const appEnv: ENV;
  export default appEnv;
}
