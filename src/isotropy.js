/* @flow */
import type { KoaType } from "koa";
import koa from "koa";
import mount from "isotropy-mount";
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

const isotropy = async function(apps: Object, options: IsotropyOptionsType) : Promise<IsotropyResultType> {
    const dir = options.dir || __dirname;
    const port = options.port || 8080;
    const defaultInstance: KoaType = options.defaultInstance || new koa();
    const plugins: Plugins = options.plugins || {};

    plugins["static"] = staticPlugin;
    plugins["webapp"] = webappPlugin;
    plugins["graphql"] = graphqlPlugin;
    plugins["react"] = reactPlugin;

    const pluginOptions = {
        dir,
        port
    };

    for (let app of apps) {
        const plugin: Plugin = plugins[app.type];
        const appSettings = plugin.getDefaults(app);
        if (appSettings.path === "/") {
            await plugin.setup(appSettings, defaultInstance, pluginOptions);
        } else {
            const newInstance = new koa();
            await plugin.setup(appSettings, newInstance, pluginOptions);
            defaultInstance.use(mount(appSettings.path, newInstance));
        }
    }

    // If we were passed in defaultInstance via options, listen() must be done at callsite.
    if (!options.defaultInstance) {
        defaultInstance.listen(port);
    }

    return {
        koa: defaultInstance
    };
};

export default isotropy;
