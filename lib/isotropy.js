(function() {
    "use strict";

    var co = require("co"),
        Router = require('isotropy-router');



    var Isotropy = function(mode, router) {
        this.mode = mode;
        this.router = router || new Router();
    };


    Isotropy.prototype.addRoutes = function(routes, fnResultTransformer) {
        var self = this;
        routes.forEach(function(route) {
            if (!fnResultTransformer) {
                self.router.addPattern(
                    route.method,
                    route.url,
                    function*() {
                        yield* route.handler.apply(this, arguments);
                    }
                );
            } else {
                self.router.addPattern(
                    route.method,
                    route.url,
                    function*() {
                        yield* fnResultTransformer.call(this, route.handler, arguments);
                    }
                );
            }
        });
    };


    module.exports = Isotropy;

})();
