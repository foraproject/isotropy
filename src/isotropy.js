import path from "path";
import Router from "isotropy-router";
import koa from "koa";
import koaMount from "koa-mount";
import koaStatic from "koa-static";

let isotropy = async function(apps, dir, port) {

    let getDefaultValues = function(key, val) {
        let result = (typeof val.module !== "undefined") ? val : { module: val };

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

    let hostStatic = async function(module, server) {
        server.use(koaStatic(path.join(dir, module.path)));
    };


    let hostReactUI = async function(module, server) {
        let router = new Router(module.routes, server);
    };


    let hostGraphqlAPI = async function(module, server) {
        let router = new Router(module.routes, server);
    };


    let hostService = async function(module, server) {
        let router = new Router(module.routes, server);
    };

    //Let's create default instance.
    //We use this if numInstances is unspecified for an app.
    let defaultInstance = koa();

    for (let key in apps) {
        let val = getDefaultValues(key, apps[key]);

        let hostFn = {
            "static": hostStatic,
            "ui_react": hostReactUI,
            "api_graphql": hostGraphqlAPI,
            "service": hostService
        }[val.type];

        if (val.path === "/") {
            await hostFn(val.module, defaultInstance);
        } else {
            let newInstance = koa();
            await hostFn(val.module, newInstance);
            defaultInstance.use(koaMount(val.path, newInstance));
        }
    }

    defaultInstance.listen(port);
};

export default isotropy;
