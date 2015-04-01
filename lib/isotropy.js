(function() {
    "use strict";

    var koaSend = require("koa-send"),
        Router = require('isotropy-router');

    var staticDirectories = [],
        routes = [],
        pageRoutes = [];


    var Isotropy = function() {
        this.router = new Router();
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


    Isotropy.prototype.init = function*() {
        this.setupStaticDirectories();
        this.setupRoutes();
        this.setupPageRoutes();
    };


    Isotropy.prototype.koaRoute = function() {
        return this.router.koaRoute();
    };


    Isotropy.prototype.setupStaticDirectories = function(router, root) {
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
