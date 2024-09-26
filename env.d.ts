declare module "app-env" {
  interface ENV {
    VITE_TEST: string;
    VITE_TEST_2: number;
    VITE_TEST_3: boolean[];
  }

  const appEnv: ENV;
  export default appEnv;
}
