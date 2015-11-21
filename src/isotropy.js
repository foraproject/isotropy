import path from "path";
import koa from "koa";
import Router from "isotropy-router";
import mount from "isotropy-mount";
import staticHandler from "isotropy-static";
import graphqlHTTP from 'koa-graphql';

const isotropy = async function(apps, dir, port) {

    const getDefaultValues = function(key, val) {
        const result = (typeof val.module !== "undefined" || val.type === "static") ? val : { module: val };

        //The 'static' module defaults to path "/static".
        if (key === "static") {
            result.type = result.type || "static";
            result.path = result.path || "/static";
        }
        //The 'ui_react' module defaults to path "/".
        else if (key === "ui_react") {
            result.type = result.type || "ui_react";
            result.path = result.path || "/";
        }
        //The 'api_graphql' module defaults to path "/graphql".
        else if (key === "api_graphql") {
            result.type = result.type || "api_graphql";
            result.path = result.path || "/graphql";
        }
        //Other modules are hosted at /module-name
        else {
            result.type = result.type || "service";
            result.path = result.path || `/${key}`;
        }

        return result;
    };


    const hostStatic = async function(app, server) {
        server.use(staticHandler(path.join(dir, app.dir)));
    };


    const hostReactUI = async function(app, server) {
        let router = new Router();
        router.add(app.module.routes);
        server.use(async (ctx, next) => { await router.doRouting(ctx, next) });
    };


    const hostGraphqlAPI = async function(app, server) {
        server.use(graphqlHTTP((request, context) => ({
          schema: MySessionAwareGraphQLSchema,
          rootValue: { session: context.session },
          graphiql: true
        })));
    };


    const hostService = async function(app, server) {
        let router = new Router();
        router.add(app.module.routes);
        server.use(async (ctx, next) => { await router.doRouting(ctx, next) });
    };

    //Let's create default instance.
    //We use this if numInstances is unspecified for an app.
    const defaultInstance = new koa();

    for (let key in apps) {
        const val = getDefaultValues(key, apps[key]);

        const hostFn = {
            "static": hostStatic,
            "ui_react": hostReactUI,
            "api_graphql": hostGraphqlAPI,
            "service": hostService
        }[val.type];

        if (val.path === "/") {
            await hostFn(val, defaultInstance);
        } else {
            const newInstance = new koa();
            await hostFn(val, newInstance);
            defaultInstance.use(mount(val.path, newInstance));
        }
    }

    defaultInstance.listen(port);
};

export default isotropy;
