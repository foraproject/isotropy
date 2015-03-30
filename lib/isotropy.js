(function() {
    "use strict";

    var koaSend = require("koa-send"),
        Router = require('isotropy-router');


    var Isotropy = function(options) {
        this.routes = options.routes;
        this.staticDirectories = options.staticDirectories;
        this.router = new Router();
    };


    Isotropy.prototype.init = function*() {
        addRoutes(this.routes, this.router);
        addStaticDirectories(this.router);
    };


    Isotropy.prototype.koaRoute = function() {
        return this.router.koaRoute();
    };


    var addStaticDirectories = function(router) {
        router.when(
            function() {
                var path = this.path.split("/");
                return path.length >= 2 && ["public", "js", "vendor", "css", "images", "fonts"].indexOf(path[1]) > -1;
            },
            function*() {
                var path = this.path.split("/");
                switch(path[1]) {
                    case "public":
                        yield koaSend(this, this.path, { root: baseConfig.services.file.publicDirectory });
                    default:
                        yield koaSend(this.koaRequest, this.path, { root: '../www-client/app/www' });
                }
                return false;
            }
        );
    };


    var addRoutes = function(routes, router) {
        routes.forEach(function(route) {
            router[route.method](route.url, route.handler);
        });
    };

    module.exports = Isotropy;

})();
