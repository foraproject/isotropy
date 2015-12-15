import __polyfill from "babel-polyfill";
import should from 'should';
import http from "http";
import isotropy from "../isotropy";
import koa from "koa";
import querystring from "querystring";
import MyComponent from "./react/my-component";
import MySchema from "./graphql/my-schema";

describe("Isotropy", () => {

    let defaultInstance: KoaAppType;

    const makeRequest = (host, port, path, method, headers, _postData, cb, onErrorCb) => {
        const postData = (typeof _postData === "string") ? _postData : querystring.stringify(_postData);
        const options = { host, port, path, method, headers };

        let result = "";
        const req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(data) { result += data; });
            res.on('end', function() { cb(result); });
        });
        req.on('error', function(e) { onErrorCb(e); });
        req.write(postData);
        req.end();
    };


    before(function() {
        defaultInstance = new koa();
        defaultInstance.listen(8080);
    });


    it(`Should serve a web app at /`, () => {
        const app = {
            routes: [
                { url: "/", method: "get", handler: async (context) => { context.body = "hello, root"; } }
            ]
        };

        const apps = [
            { type: "webapp", module: app, path: "/" }
        ];

        const promise = new Promise((resolve, reject) => {
            isotropy(apps, { dir: __dirname, defaultInstance }).then(() => {
                makeRequest("localhost", 8080, "/", "GET", { 'Content-Type': 'application/x-www-form-urlencoded' }, {}, resolve, reject);
            }, reject);
        });

        return promise.then((data) => {
            data.should.equal("hello, root");
        });
    });


    it(`Should serve a static site at /static`, () => {
        const apps = [
            { type: "static" }
        ];

        const promise = new Promise((resolve, reject) => {
            isotropy(apps, { dir: __dirname, defaultInstance }).then(() => {
                makeRequest("localhost", 8080, "/static/hello.txt", "GET", { 'Content-Type': 'application/x-www-form-urlencoded' }, {}, resolve, reject);
            }, reject);
        });

        return promise.then((data) => {
            data.should.equal("hello, world\n");
        });
    });


    it(`Should serve a web app at /webapp`, () => {
        const app = {
            routes: [
                { url: "/webapp", method: "get", handler: async (context) => { context.body = "hello, world"; } }
            ]
        };

        const apps = [
            { type: "webapp", module: app, path: "/" }
        ];

        const promise = new Promise((resolve, reject) => {
            isotropy(apps, { dir: __dirname, defaultInstance }).then(() => {
                makeRequest("localhost", 8080, "/webapp", "GET", { 'Content-Type': 'application/x-www-form-urlencoded' }, {}, resolve, reject);
            }, reject);
        });

        return promise.then((data) => {
            data.should.equal("hello, world");
        });
    });


    [[false, "hello_nonstatic"], [true, "hello_static"]].forEach(([renderToStaticMarkup, url]) => {
        const strStaticRender = renderToStaticMarkup ? "as static markup" : "as string";
        it(`Should serve a React Component ${strStaticRender} at /ui`, () => {
            const moduleConfig = {
                routes: [
                    { url: `/${url}/:id`, method: "GET", component: MyComponent }
                ]
            }
            const apps = [
                { type: "react", module: moduleConfig, path: "/ui", renderToStaticMarkup }
            ];

            const options = {
                dir: __dirname,
                defaultInstance
            };

            const promise = new Promise((resolve, reject) => {
                isotropy(apps, options).then(() => {
                    makeRequest("localhost", 8080, `/ui/${url}/200`, "GET", { 'Content-Type': 'application/x-www-form-urlencoded' }, {}, resolve, reject);
                }, reject);
            });

            return promise.then((data) => {
                if (renderToStaticMarkup) {
                    data.should.equal("<html><body>Hello 200</body></html>");
                } else {
                    data.should.startWith("<html data-reactid");
                }
            });
        });
    });


    it(`Should run GraphQL Services`, () => {
        const apps = [
            { type: "graphql", schema: MySchema }
        ];

        const options = {
            dir: __dirname,
            defaultInstance,
            graphql: {
                graphiql: true
            }
        };

        const promise = new Promise((resolve, reject) => {
            isotropy(apps, options).then(() => {
                makeRequest("localhost", 8080, "/graphql", "POST", { 'Content-Type': 'application/json' }, '{ "query": "query QueryRoot { test }" }', resolve, reject);
            }, reject);
        });

        return promise.then((data) => {
            data.should.startWith(`{"data":{"test":"Hello World"}}`);
        });
    });
});
