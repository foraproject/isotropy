import Router from "isotropy-router";
import koa from "koa";

/*
    You can write the export as
        { ui_react, api_graphql, filetore }

    A module named 'static' defaults to type "static".
    A module named 'ui_react' defaults to type "ui_react".
    A module named 'api_graphql' defaults to type "api_graphql".
    Other modules defaults to type "service".

    The 'static' module defaults to path "/static".
    The 'ui_react' module defaults to path "/".
    The 'api_graphql' module defaults to path "/graphql".
    Other modules are hosted at /module-name

    Domain and port defaults to "auto".
    This means that the system will assign a port based on rules.
*/
let getDefaultValues = function(key, val) {
    let result = (typeof val.module !== "undefined") ? val : { module: val };

    if (!result.domain) result.domain = "auto";
    if (!result.port) result.port = 8080;

    if (key === "static") {
        result.type = result.type || "static";
        result.path = result.path || "/static";
    } else if (key === "ui_react") {
        result.type = result.type || "ui_react";
        result.path = result.path || "/";
    } else if (key === "api_graphql") {
        result.type = result.type || "api_graphql";
        result.path = result.path || "/graphql";
    } else {
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


export default function(app) {
    for (let key in app) {
        let val = getDefaultValues(key, app[key]);

        let server = new koa();

        let hostFn = {
            "static": hostStatic,
            "ui_react": hostReactUI,
            "api_graphql": hostGraphqlAPI,
            "service": hostService
        }[val.type];
        hostFn(val.module, server);

        server.listen(val.port);
    }
};
