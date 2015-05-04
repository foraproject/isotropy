(function() {
    "use strict";

    var co = require("co"),
        Router = require('isotropy-router');


    var Isotropy = function(options, router) {
        this.options = options;
        this.router = router || new Router();
    };


    Isotropy.prototype.init = function() {
        var self = this;
        return co(function*() {

            var app = null;

            if (self.options.koa) {
                app = self.options.koa();
            }

            if (self.options.beforeInit) {
                yield* self.options.beforeInit(app);
            }

            if (self.options.koaSend) {
                self.addStaticDirectories(self.options.staticDirectories, self.options.config.destination);
            }

            if (self.options.routing.api) {
                self.addRoutes(self.options.routing.api.routes);
            }

            if (self.options.routing.pages) {
                self.addRoutes(self.options.routing.pages.routes, self.options.routing.pages.layout);
            }

            //Return a generator function that works with koa
            var routeFunc = function*(next) {
                yield* self.router.doRouting(this, next);
            };

            app.use(routeFunc);

            var host = self.options.config.host || "127.0.0.1";
            var port = self.options.config.port || 8080;

            app.listen(port);

            var result = {
                host: host,
                port: port
            };

            if (self.options.afterInit) {
                yield* self.options.afterInit(app);
            }

            return { host: host, port: port, app: app };
        });
    };


    Isotropy.prototype.addStaticDirectories = function(staticDirectories, root) {
        var self = this;
        this.router.when(
            function() {
                var path = this.path.split("/");
                return path.length >= 2 && staticDirectories.indexOf(path[1]) > -1;
            },
            function*() {
                var path = this.path.split("/");
                yield self.options.koaSend(this, this.path, { root: root });
                return false;
            }
        );
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
