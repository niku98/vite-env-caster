declare module "app-env" {
  interface ENV {
    VITE_TEST: number;
    VITE_TEST_2: number;
    VITE_TEST_3: number[];
  }

  const appEnv: ENV;
  export default appEnv;
}
