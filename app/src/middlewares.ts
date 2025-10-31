import Koa from "koa";
import koabodyparser from "koa-bodyparser";
import {
  AuthMiddleware,
  CookiesMiddleware,
  ErrorMiddleware,
  SentryMiddleware,
} from "marklie-ts-core";

export function applyMiddlewares(app: Koa) {

  const middlewares = [
    ErrorMiddleware(),
    SentryMiddleware(),
    koabodyparser(),
    CookiesMiddleware,
    AuthMiddleware(["/api/scheduling-options/available-metrics"]),
  ];

  for (const middleware of middlewares) {
    app.use(middleware);
  }
}
