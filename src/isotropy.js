import getRouter from "isotropy-router";

export default function(koa, mount, pathToRegexp) {

    let Router = getRouter(pathToRegexp);

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


    let hostStatic = function(module, server) {
        var router = new Router(module.routes, server);
    };


    let hostReactUI = function(module, server) {
        var router = new Router(module.routes, server);
    };


    let hostGraphqlAPI = function(module, server) {
        var router = new Router(module.routes, server);
    };


    let hostService = function(module, server) {
        var router = new Router(module.routes, server);
    };


    return function(apps, port) {
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

            if (val.module.path === "/") {
                hostFn(val.module, defaultInstance);
            } else {
                var newInstance = koa();
                hostFn(val.module, newInstance);
                defaultInstance.use(mount(newInstance), val.module.path);
            }

            hostFn(val.module, defaultInstance);
        }

        defaultInstance.listen(port);
    };
};
