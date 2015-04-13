(function() {
    "use strict";

    var co = require("co"),
        Router = require('isotropy-router');

    var staticDirectories = [],
        routes = [],
        pageRoutes = [];


    var Isotropy = function(router) {
        this.router = router || new Router();
    };


    Isotropy.prototype.addStaticDirectories = function(directories, basePath) {
        staticDirectories.push(directories);
    };


    Isotropy.prototype.addRoutes = function(routes) {
        routes.push(routes);
    };


    Isotropy.prototype.addPageRoutes = function(routes, layout) {
        pageRoutes.push({ routes: routes, layout: layout });
    };


    Isotropy.prototype.initKoa = function(koa, koaSend, options) {
        var self = this;
        return co(function*() {
            var koa = require('koa');
            var app = koa();

            var staticDirectories = options.staticDirectories;
            var config = options.config;
            var routes = options.routes;
            var layout = options.layout;

            self.addStaticDirectories(staticDirectories, config.destination);
            self.addPageRoutes(routes.pages, layout);

            self.setupStaticDirectories();
            self.setupRoutes();
            self.setupPageRoutes();

            var host = process.argv[2] || config.host || "127.0.0.1";
            var port = process.argv[3] || config.port || 8080;

            app.use(self.koaRoute());
            app.listen(port);

            var result = {
                host: host,
                port: port
            };

            if (options.cb)
                options.cb(result);
        });
    };


    Isotropy.prototype.koaRoute = function() {
        return this.router.koaRoute();
    };


    Isotropy.prototype.setupStaticDirectories = function() {
        this.router.when(
            function() {
                var path = this.path.split("/");
                return path.length >= 2 && staticDirectories.indexOf(path[1]) > -1;
            },
            function*() {
                var path = this.path.split("/");
                yield koaSend(this.koaRequest, this.path, { root: root });
                return false;
            }
        );
    };


    Isotropy.prototype.setupRoutes = function() {
        var self = this;
        routes.forEach(function(_routes) {
            _routes.forEach(function(route) {
                self.router[route.method](route.url, function*() { this.body = route.handler.call(this); });
            });
        });
    };


    Isotropy.prototype.setupPageRoutes = function() {
        var self = this;
        pageRoutes.forEach(function(entry) {
            entry.routes.forEach(function(route) {
                self.router[route.method](route.url, function*() { this.body = (yield* entry.layout(route.handler, this)); });
            });
        });
    };


    module.exports = Isotropy;

})();
