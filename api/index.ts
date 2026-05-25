import appBundle from "../dist/server.cjs";

const app = (appBundle as any).default || appBundle;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;
