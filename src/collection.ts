import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

export interface ArticlesLoaderOptions {
  /** Base directory of the generated `.md` files. Must match the integration's `contentDir`. */
  base?: string;
  /** Glob pattern(s) relative to `base`. */
  pattern?: string | string[];
}

/**
 * A `glob()` loader preconfigured for the directory the integration writes
 * article `.md` files into. Pass it to `defineCollection({ loader: ... })`.
 */
export const articlesLoader = (options: ArticlesLoaderOptions = {}) =>
  glob({
    pattern: options.pattern ?? "**/*.md",
    base: options.base ?? "./src/content/blogapi",
  });

export interface TagsLoaderOptions {
  /** Path of the generated tags JSON file. Must match the integration's `tagsFile`. */
  file?: string;
}

/**
 * A `file()` loader preconfigured for the tags JSON the integration writes.
 * One entry per tag, so `/tags` and `/tags/{tag}` pages can be built from
 * the collection without issuing any GraphQL from the site.
 */
export const tagsLoader = (options: TagsLoaderOptions = {}) =>
  file(options.file ?? "./src/content/blogapi/tags.json");

/**
 * Schema of the generated tags JSON entries.
 * `articles` holds the frontmatter `id`s of the articles carrying the tag,
 * newest first — filter the article collection with them.
 */
export const tagsSchema = z.object({
  id: z.string(),
  name: z.string(),
  articles: z.array(z.string()),
});

// Minimal structural type of Astro's SchemaContext, typed locally so this
// module does not depend on the `astro:content` virtual module.
interface SchemaContextLike {
  image: () => z.ZodTypeAny;
}

/**
 * Frontmatter schema of the generated article `.md` files. `thumbnail` goes
 * through `image()` so Astro optimizes the locally downloaded file.
 * Use as `defineCollection({ schema: articlesSchema, ... })`.
 */
export const articlesSchema = ({ image }: SchemaContextLike) =>
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
