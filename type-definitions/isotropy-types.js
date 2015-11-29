type KoaContextType = {
    path: string,
    method: string
};

type NextType = () => Promise;

type MiddlewareType = (context: KoaContextType, next: NextType) => Promise;

type RouteDefinitionType = {
    method: string,
    url: string,
    handler: (context: KoaContextType, ...params: Array<any>) => Promise
};

type ModuleType = {
    routes: Array<RouteDefinitionType>
}

type WebAppType = {
    module: ModuleType,
    type: string,
    path: string
};

type ReactUIType = {
    module: ModuleType,
    type: string,
    path: string
};

type GraphQLSchema = {
};

type GraphQLServiceType = {
    schema: GraphQLSchema,
    type: string,
    path: string
};

type StaticSiteType = {
    dir: string,
    path: string
};

type ApplicationDefinitionType = WebAppType | ReactUIType | GraphQLServiceType | StaticSiteType;

type ApplicationConfigType = {
    [key: string]: ApplicationDefinitionType
};
