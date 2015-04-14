(function() {
    "use strict";

    var Router = require('isotropy-router');


    var Isotropy = function(mode, router) {
        this.mode = mode;
        this.router = router || new Router();
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
