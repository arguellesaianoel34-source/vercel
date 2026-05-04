import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { pinoHttp as pinoHttpNamespace } from "pino-http";
import type { IncomingMessage, ServerResponse } from "http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const pinoMiddleware = typeof pinoHttp === 'function' 
  ? pinoHttp 
  : (pinoHttp as any).default || pinoHttpNamespace;

app.use(
  pinoMiddleware({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

export default app;
