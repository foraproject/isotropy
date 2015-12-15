declare module "koa" {
    declare type KoaType = {
        use: (middleware: KoaMiddlewareType) => void;
        middleware: Array<KoaMiddlewareType>
    }

    declare type KoaMiddlewareType = (context: KoaContextType, next: KoaNextType) => Promise

    declare type KoaNextType = () => Promise

    declare type KoaContextType = {
        code: number;
        redirect: (url: string) => void;
        method: string;
        path: string;
        status: number;
        body: string;
    }

    declare function exports() : KoaType;
}
