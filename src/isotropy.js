/* @flow */
import getIsotropy from "isotropy-core";
import urlMiddleware from "isotropy-middleware-url";
import bodyMiddleware from "isotropy-middleware-body";
import staticPlugin from "isotropy-plugin-static";
import webappPlugin from "isotropy-plugin-webapp";
import graphqlPlugin from "isotropy-plugin-graphql";
import reactPlugin from "isotropy-plugin-react";

import type { IsotropyOptionsType, IsotropyResultType } from "isotropy-core";
import type { Server } from "./flow/http";

type IsotropyFnType = (apps: Object, options: IsotropyOptionsType) => Promise<IsotropyResultType>;

const isotropy: IsotropyFnType = getIsotropy({
  static: staticPlugin,
  webapp: webappPlugin,
  graphql: graphqlPlugin,
  react: reactPlugin
});

export default async function(apps, options) {
  options.handler = (router) => (req, res) => {
    urlMiddleware(req, res)
    .then(() => bodyMiddleware(req, res))
    .then(() => router.doRouting(req, res));
  };
  return await isotropy(apps, options);
};
