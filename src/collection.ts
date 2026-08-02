import { glob } from "astro/loaders";
import { z } from "astro/zod";

export interface BlogApiLoaderOptions {
  /** Base directory of the generated `.md` files. Must match the integration's `contentDir`. */
  base?: string;
  /** Glob pattern(s) relative to `base`. */
  pattern?: string | string[];
}

/**
 * A `glob()` loader preconfigured for the directory the integration writes
 * `.md` files into. Pass it to `defineCollection({ loader: ... })`.
 */
export const blogApiLoader = (options: BlogApiLoaderOptions = {}) =>
  glob({
    pattern: options.pattern ?? "**/*.md",
    base: options.base ?? "./src/content/blogapi",
  });

// Minimal structural type of Astro's SchemaContext, typed locally so this
// module does not depend on the `astro:content` virtual module.
interface SchemaContextLike {
  image: () => z.ZodTypeAny;
}

/**
 * Frontmatter schema of the generated `.md` files. `thumbnail` goes through
 * `image()` so Astro optimizes the locally downloaded file.
 * Use as `defineCollection({ schema: blogApiSchema, ... })`.
 */
export const blogApiSchema = ({ image }: SchemaContextLike) =>
  z.object({
    id: z.string(),
    title: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    thumbnail: image(),
    tags: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
  });
