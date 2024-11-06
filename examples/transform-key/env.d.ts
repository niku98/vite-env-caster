declare module "app-env" {
  interface ENV {
    testString: string;
    testNumber: number;
    testBoolean: boolean;
    testArray: (number | boolean | string)[];
    testArrayString: string[];
    testArrayNumber: number[];
    testArrayBoolean: boolean[];
  }

  const appEnv: ENV;
  export default appEnv;
}
