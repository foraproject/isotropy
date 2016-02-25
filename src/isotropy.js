/* @flow */
import getIsotropy from "isotropy-core";
import urlMiddleware from "isotropy-middleware-url";
import bodyMiddleware from "isotropy-middleware-body";
import staticPlugin from "isotropy-plugin-static";
import webappPlugin from "isotropy-plugin-webapp";
import graphqlPlugin from "isotropy-plugin-graphql";
import reactPlugin from "isotropy-plugin-react";

import Router from "isotropy-router";
import type { IsotropyOptionsType, IsotropyResultType } from "isotropy-core";
import type { IncomingMessage, ServerResponse, Server } from "./flow/http";

type IsotropyFnType = (apps: Object, options: IsotropyOptionsType) => Promise<IsotropyResultType>;

const isotropy: IsotropyFnType = getIsotropy({
  static: staticPlugin,
  webapp: webappPlugin,
  graphql: graphqlPlugin,
  react: reactPlugin
});

export default async function(apps: Object, options: IsotropyOptionsType) : Promise<IsotropyResultType> {
  const onError = options.onError ||
    ((req, res, e) => {
      res.statusCode = 200;
      res.statusMessage = e.toString();
      res.end(e.toString());
    });
  options.handler = (router: Router) => (req: IncomingMessage, res: ServerResponse) => {
    urlMiddleware(req, res)
    .then(() => bodyMiddleware(req, res))
    .then(() => router.doRouting(req, res).catch((e) => onError(req, res, e)));
  };
  return await isotropy(apps, options);
};
