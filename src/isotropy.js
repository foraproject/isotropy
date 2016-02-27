/* @flow */
import getIsotropy from "isotropy-core";
import urlMiddleware from "isotropy-middleware-url";
import bodyMiddleware from "isotropy-middleware-body";
import Router from "isotropy-router";
import type { PluginType } from "isotropy-core";
import type { IsotropyOptionsType, IsotropyResultType } from "isotropy-core";
import type { IncomingMessage, ServerResponse, Server } from "./flow/http";

type IsotropyFnType = (apps: Object, options: IsotropyOptionsType) => Promise<IsotropyResultType>;

export default async function(apps: Object, plugins: Array<PluginType>, options: IsotropyOptionsType) : Promise<IsotropyResultType> {
  const isotropy: IsotropyFnType = getIsotropy(plugins);

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
