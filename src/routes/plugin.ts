import { join } from "path";
import { ROOT_PATH } from "@/constant";
import logger from "@/config/logger";
import { pathToFileURL } from "url";
interface RouteModule {
  name: string;
  routes: any[];
}
export const routeConfig = [
  "admin",
  "category",
  "user",
  "event",
  "family",
  "invitation",
  "todo",
];
class RouteLoader {
  private loadedRoutes: RouteModule[] = [];
  private modulesPath: string;

  constructor() {
    this.modulesPath = join(ROOT_PATH, "../src/modules");
  }

  private scanDirectory(dir: string): string[] {
    const routeFiles: string[] = [];
    try {
      for (const config of routeConfig) {
        const fullPath = join(dir, config);
        routeFiles.push(fullPath);
      }
    } catch (error) {
      //@ts-ignore
      logger.warn(`Failed to scan directory ${dir}:`, error);
    }
    return routeFiles;
  }
  private async loadModuleRoutes(
    modulePath: string,
  ): Promise<RouteModule | null> {
    try {
      const routeFilePath = join(modulePath, "route.ts");
      const moduleRoutes = await import(pathToFileURL(routeFilePath).href);

      if (!moduleRoutes.default || !Array.isArray(moduleRoutes.default)) {
        logger.warn(`Invalid route format in ${modulePath}`);
        return null;
      }
      const moduleName = modulePath.split("modules/")[1];
      return {
        name: moduleName || "",
        routes: moduleRoutes.default,
      };
    } catch (error: any) {
      //@ts-ignore
      logger.error(
        `Failed to load routes for ${modulePath}:`,
        error?.message || String(error),
      );
      console.error(`[Route Loading Error] ${modulePath}:`, error);
      return null;
    }
  }
  async loadAllRoutes(): Promise<any[]> {
    try {
      const routeFiles = this.scanDirectory(this.modulesPath);
      logger.info(`Total of ${routeFiles.length} route files found.`);
      const modules = await Promise.all(
        routeFiles.map((m) => this.loadModuleRoutes(m)),
      );
      this.loadedRoutes = modules.filter(
        (module): module is RouteModule => module !== null,
      );
      return this.loadedRoutes.flatMap((m) => m.routes);
    } catch (error) {
      //@ts-ignore
      logger.error("Error loading all routes:", error);
      throw error;
    }
  }
}
const routeLoader = new RouteLoader();
export default routeLoader;
export { RouteLoader, type RouteModule };
