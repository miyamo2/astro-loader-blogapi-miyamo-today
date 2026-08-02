export {
  blogApiMiyamoToday,
  type BlogApiIntegrationOptions,
} from "./integration";
export {
  blogApiLoader,
  blogApiSchema,
  type BlogApiLoaderOptions,
} from "./collection";
export { sync, type SyncOptions, type SyncResult, type SyncLogger } from "./sync";
export { fetchAllArticles, type Article } from "./client";

import { blogApiMiyamoToday } from "./integration";
export default blogApiMiyamoToday;
