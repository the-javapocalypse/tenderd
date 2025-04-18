import { ExpressServer } from "./common/services/express-server.service";
import createContainer from "./container";
import * as Sentry from "@sentry/node";

const start = async () => {
  // initialize container
  const container = await createContainer();
  const { config } = container;

  Sentry.init({
    dsn: config.sentryDsn,
    enabled: config.isProd,
    environment: config.env,
  });

  // create express server
  const expressServer = new ExpressServer(container);
  const app = expressServer.createExpressApp();
};

start().catch((error) => {
  console.error("App failed to start:", error);
});
