(function() {
    "use strict";

    var KoaMode = function(koa, koaSend, options, isotropy) {
        this.koa = koa;
        this.koaSend = koaSend;
        this.options = options;
        this.isotropy = isotropy;
    };


    KoaMode.prototype.init = function*() {
        var app = this.koa();

        this.addStaticDirectories(this.options.staticDirectories,this.options.config.destination);
        this.isotropy.addPageRoutes(this.options.routes.pages, this.options.layout);
        app.use(this.isotropy.router.koaRoute());

        var host = process.argv[2] || this.options.config.host || "127.0.0.1";
        var port = process.argv[3] || this.options.config.port || 8080;

        app.listen(port);

        var result = {
            host: host,
            port: port
        };

        if (this.options.cb)
            this.options.cb(result);
    };


    KoaMode.prototype.koaRoute = function() {
        return this.isotropy.router.koaRoute();
    };


    KoaMode.prototype.addStaticDirectories = function(staticDirectories, root) {
        var self = this;
        this.isotropy.router.when(
            function() {
                var path = this.path.split("/");
                return path.length >= 2 && staticDirectories.indexOf(path[1]) > -1;
            },
            function*() {
                var path = this.path.split("/");
                yield self.koaSend(this, this.path, { root: root });
                return false;
            }
        );
    };

    module.exports = KoaMode;

})();
