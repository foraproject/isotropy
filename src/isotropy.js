/* @flow */
import getIsotropy from "isotropy-core";
import urlMiddleware from "isotropy-middleware-url";
import bodyMiddleware from "isotropy-middleware-body";
import Router from "isotropy-router";
import type { PluginType } from "isotropy-core";
import type { IsotropyOptionsType, IsotropyResultType } from "isotropy-core";
import type { IncomingMessage, ServerResponse, Server } from "isotropy-interfaces/node/http";

type IsotropyFnType = (apps: Array<Object>, options: IsotropyOptionsType<IncomingMessage, ServerResponse>) => Promise<IsotropyResultType>;

export default async function(apps: Array<Object>, plugins: Array<PluginType>, options: IsotropyOptionsType) : Promise<IsotropyResultType> {
  const isotropy: IsotropyFnType = getIsotropy(plugins);

  options.handler = (router: Router) => (req: IncomingMessage, res: ServerResponse) => {
    urlMiddleware(req, res)
    .then(() => bodyMiddleware(req, res))
    .then(() => router.doRouting(req, res));
  };

  return await isotropy(apps, options);
};
