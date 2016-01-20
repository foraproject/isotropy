/* @flow */
import type { KoaType } from "koa";
import getIsotropy from "isotropy-core";
import staticPlugin from "isotropy-plugin-static";
import webappPlugin from "isotropy-plugin-webapp";
import graphqlPlugin from "isotropy-plugin-graphql";
import reactPlugin from "isotropy-plugin-react";

type Plugin = {
  getDefaults: (app: Object) => Object,
  setup: (appSettings: Object, instance: KoaType, options: PluginOptions) => Promise
};

type Plugins = {
  [key: string]: Plugin
}

type PluginOptions = {
  dir: string,
  port: number,
  graphiql?: boolean
}

type IsotropyOptionsType = {
  dir: string,
  port: number,
  plugins: Plugins,
  defaultInstance: KoaType
};

export type IsotropyResultType = {
  koa: KoaType
};

type IsotropyFnType = (apps: Object, options: IsotropyOptionsType) => Promise<IsotropyResultType>;

const isotropy: IsotropyFnType = getIsotropy({
  static: staticPlugin,
  webapp: webappPlugin,
  graphql: graphqlPlugin,
  react: reactPlugin
});

export default isotropy;
