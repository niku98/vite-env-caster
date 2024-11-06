declare module "app-env" {
  interface ENV {
    VITE_TEST_JSON: Record<string, unknown>;
  }

  const appEnv: ENV;
  export default appEnv;
}
