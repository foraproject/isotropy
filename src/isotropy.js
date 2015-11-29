/* @flow */
import path from "path";
import koa from "koa";
import Router from "isotropy-router";
import mount from "isotropy-mount";
import staticHandler from "isotropy-static";
import graphqlHTTP from 'koa-graphql';


const isotropy = async function(apps: ApplicationConfigType, dir: string, port: number) : Promise {

    const getDefaultValues = function(key: string, val: Object = {}) : ApplicationDefinitionType {
        if (key === "static") {
            const result: StaticSiteType = {
                dir: val.dir || "static",
                path: val.path || "/static"
            };
            return result;
        }
        else if (key === "ui_react") {
            if (!val.type === "ui_react") {
                val = { module: val }
            }
            const result: ReactUIType  =  {
                module: val.module,
                type: val.type || "ui_react",
                path: val.path || "/"
            };
            return result;
        }
        else if (key === "api_graphql") {
            if (!val.type === "api_graphql") {
                val = { schema: val }
            }
            const result: GraphQLServiceType = {
                schema: val.schema,
                type: val.type || "api_graphql",
                path: val.path || "/graphql"
            };
            return result;
        }
        else {
            if (!val.module) {
                val = { module: val }
            }
            const result: WebAppType = {
                module: val.module,
                type: val.type || "app",
                path: val.path || `/${key}`
            };
            return result;
        }
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
