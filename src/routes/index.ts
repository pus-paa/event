import checkAuthentication from "../middlewares/checkAuthentication";
import routeLoader from "./plugin";
export interface IAuthRequest extends Request {
  query: any;
  params: any;
  body: any;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    familyId?: number | null;
  };
}
let routes: any[] = [];
export interface IRoute {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  controller: (req: IAuthRequest) => Promise<any>;
  authorization?: boolean;
  authCheckType?: string[];
  validation?: any;
}
//const routeHandlerCache = new Map();
const createRouteHandler = (controller: Function, path: string) => {
  // const cacheKey = `${controller.name}-${path}`;
  // if (routeHandlerCache.has(cacheKey)) {
  // 	return routeHandlerCache.get(cacheKey);
  // }
  const handler = async (req: any, res: any, next: any) => {
    try {
      const startTime = Date.now();
      const data = await controller(req);
      const duration = Date.now() - startTime;
      if (duration > 500) {
        console.warn(`Slow API call: /api/${path} took ${duration}ms`);
      }
      res.json({
        data,
        message: "SUCCESS",
      });
    } catch (err: any) {
      console.error(err);
      next(err);
    }
  };

  // routeHandlerCache.set(cacheKey, handler);
  return handler;
};
const routesInit = async (app: any) => {
  try {
    routes = await routeLoader.loadAllRoutes();
    for (const route of routes) {
      const {
        method,
        path,
        controller,
        authorization,
        authCheckType,
        validation,
      } = route as IRoute | any;
      const routeHandler = createRouteHandler(controller, path);
      console.log("route handler", routeHandler);

      let middlewares = [];

      if (validation) middlewares.push(validation);

      if (authorization) {
        middlewares.push((req: any, _: any, next: any) => {
          checkAuthentication(req, authCheckType || [])
            .then(() => next())
            .catch(next);
        });
      }

      middlewares.push(routeHandler);

      app[method](`/api/${path}`, ...middlewares);
    }
  } catch (error) {
    console.error("❌ Failed to initialize routes:", error);
    throw error;
  }
};
export default routesInit;
