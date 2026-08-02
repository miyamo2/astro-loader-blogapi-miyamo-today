import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { z } from "astro/zod";
import { sync } from "./sync";

const optionsSchema = z.object({
  /** GraphQL endpoint of blogapi.miyamo.today */
  url: z.string().min(1, "url is required"),
  /** Bearer token for the endpoint */
  token: z.string().min(1, "token is required"),
  /** Directory (relative to the project root) where `.md` files are written */
  contentDir: z.string().default("src/content/blogapi"),
  /** Directory (relative to the project root) where thumbnails are written */
  assetsDir: z.string().default("src/assets/blogapi"),
  /** File (relative to the project root) where aggregated tags are written. Defaults to `{contentDir}/tags.json` */
  tagsFile: z.string().optional(),
});

export type IntegrationOptions = z.input<typeof optionsSchema>;

const PKG = "astro-loader-blogapi-miyamo-today";

// `astro dev` re-runs astro:config:setup on every config change; sync only
// once per process so editing astro.config does not re-fetch the whole API.
let hasSynced = false;

export const blogApiMiyamoToday = (options: IntegrationOptions): AstroIntegration => {
  return {
    name: PKG,
    hooks: {
      "astro:config:setup": async ({ config, command, logger }) => {
        const parsed = optionsSchema.safeParse(options ?? {});
        if (!parsed.success) {
          throw new Error(
            `[${PKG}] invalid options: ${parsed.error.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join(", ")}`,
          );
        }
        if (command === "preview") {
          return;
        }
        if (hasSynced) {
          logger.info("already synced in this process, skipping");
          return;
        }

        const root = fileURLToPath(config.root);
        await sync({
          url: parsed.data.url,
          token: parsed.data.token,
          contentDir: path.resolve(root, parsed.data.contentDir),
          assetsDir: path.resolve(root, parsed.data.assetsDir),
          tagsFile: parsed.data.tagsFile
            ? path.resolve(root, parsed.data.tagsFile)
            : undefined,
          logger,
        });
        hasSynced = true;
      },
    },
  };
};
