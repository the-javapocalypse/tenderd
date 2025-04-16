import { Router } from "express";
import type { Container } from "../container";

const createV1Router = (container: Container) => {
  const router = Router();

  return router;
};

export const createAppRouter = (container: Container) => {
  const router = Router();

  router.use("/v1", createV1Router(container));

  return router;
};
