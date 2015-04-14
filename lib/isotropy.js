(function() {
    "use strict";

    var Router = require('isotropy-router');


    var Isotropy = function(mode, router) {
        this.mode = mode;
        this.router = router || new Router();
    };


    Isotropy.prototype.addRoutes = function(routes, fnResultTransformer) {
        var self = this;
        routes.forEach(function(route) {
            if (!fnResultTransformer)
                self.router[route.method](route.url, function*() { route.handler.call(this); });
            else
                self.router[route.method](route.url, function*() { yield* fnResultTransformer(route.handler, this); });
        });
    };


    module.exports = Isotropy;

})();
