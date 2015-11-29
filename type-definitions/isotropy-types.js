type RouteType = {
    url: string,
    method: string,
    handler: (context: Object, ...params: Array<any>) => Promise
};


type WebServiceType = {
    module: WebServiceModuleType,
    type: string,
    path: string
};


type WebServiceModuleType = {
    routes: Array<RouteType>
};



/*
type AppConfigurationType = {
    [key: string]: WebServiceType | ReactUIType | GraphQLServiceType | StaticSiteType
};
*/
