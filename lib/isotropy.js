(function() {
    "use strict";

    var co = require("co"),
        Router = require('isotropy-router'),
        KoaMode = require("./koa-mode");



    var Isotropy = function(router) {
        this.router = router || new Router();
    };


    Isotropy.prototype.initKoa = function(koa, koaSend, options) {
        this.koaMode = new KoaMode(koa, koaSend, options, this);

        var self = this;
        return co(function*() {
            yield* self.koaMode.init();
        });
    };


    Isotropy.prototype.addRoutes = function(routes) {
        var self = this;
        routes.forEach(function(route) {
            self.router[route.method](route.url, function*() { this.body = route.handler.call(this); });
        });
    };


    Isotropy.prototype.addPageRoutes = function(routes, layout) {
        var self = this;
        routes.forEach(function(route) {
            self.router[route.method](route.url, function*() { this.body = (yield* layout(route.handler, this)); });
        });
    };


    module.exports = Isotropy;

})();
