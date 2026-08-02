# astro-loader-blogapi-miyamo-today

Astro (v5+) integration that sources articles from blogapi.miyamo.today (GraphQL).

Successor of [gatsby-source-blogapi-miyamo-today](https://github.com/miyamo2/gatsby-source-blogapi-miyamo-today).

## How it works

Instead of a custom Content Layer loader, this package materializes real files before the Content Layer loads, then reads them back with the standard `glob()` loader:

```
astro:config:setup hook
  ├─ fetch all articles from the GraphQL API (Relay cursor pagination / first: 24 / Bearer auth)
  ├─ download thumbnails into src/assets/blogapi/
  ├─ write src/content/blogapi/{id}.md (YAML frontmatter, thumbnail as local relative path)
  └─ write src/content/blogapi/tags.json (tags aggregated from the fetched articles)
site side: glob()/file() loaders — plain local markdown + JSON, no site-side GraphQL
```

- Articles without a thumbnail are skipped (no `.md` is generated).
- Unchanged files are skipped on re-run (content compare for `.md`, source-URL hash embedded in the image file name for thumbnails), so the output directories are CI-cacheable.
- Files for articles that no longer exist in the API are garbage-collected, so a stale cache always converges to the API state.

## Install

This package is published to GitHub Packages with restricted access.

```sh
# .npmrc
@miyamo2:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```sh
bun add @miyamo2/astro-loader-blogapi-miyamo-today
```

## Usage

### 1. `astro.config.mjs`

```js
import { defineConfig } from "astro/config";
import { blogApiMiyamoToday } from "@miyamo2/astro-loader-blogapi-miyamo-today";

export default defineConfig({
  integrations: [
    blogApiMiyamoToday({
      url: process.env.BLOGAPI_MIYAMO_TODAY_URL,
      token: process.env.BLOGAPI_MIYAMO_TODAY_TOKEN,
      // optional (defaults shown):
      // contentDir: "src/content/blogapi",
      // assetsDir: "src/assets/blogapi",
      // tagsFile: "src/content/blogapi/tags.json",
    }),
  ],
});
```

Keep `token` in an environment variable — never commit it.

### 2. `src/content.config.ts`

```ts
import { defineCollection } from "astro:content";
import {
  blogApiArticlesLoader,
  blogApiArticlesSchema,
  blogApiTagsLoader,
  blogApiTagsSchema,
} from "@miyamo2/astro-loader-blogapi-miyamo-today";

export const collections = {
  blogapi: defineCollection({
    loader: blogApiArticlesLoader(), // pass { base } if you changed contentDir
    schema: blogApiArticlesSchema,
  }),
  blogapiTags: defineCollection({
    loader: blogApiTagsLoader(), // pass { file } if you changed tagsFile
    schema: blogApiTagsSchema,
  }),
};
```

### 3. Use the collection

```astro
---
import { getCollection, render } from "astro:content";
import { Image } from "astro:assets";

const articles = await getCollection("blogapi");
const { Content } = await render(articles[0]);
---
<Image src={articles[0].data.thumbnail} alt={articles[0].data.title} />
<Content />
```

Frontmatter fields: `id`, `title`, `createdAt`, `updatedAt`, `thumbnail` (local relative path, resolved by `image()`), `tags: [{ id, name }]`.

### 4. Tag pages — no site-side GraphQL

The integration aggregates tags from the fetched articles into `tags.json`
(one entry per tag: `{ id, name, articles }`, where `articles` holds the
frontmatter `id`s of the tagged articles, newest first). `/tags` and
`/tags/{tag}` pages can be built entirely from the collections:

```astro
---
// src/pages/tags/index.astro
import { getCollection } from "astro:content";

const tags = await getCollection("blogapiTags");
---
<ul>
  {tags.map((tag) => (
    <li>
      <a href={`/tags/${tag.data.id}/`}>{tag.data.name} ({tag.data.articles.length})</a>
    </li>
  ))}
</ul>
```

```astro
---
// src/pages/tags/[id].astro
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const tags = await getCollection("blogapiTags");
  return tags.map((tag) => ({ params: { id: tag.data.id }, props: { tag } }));
}

const { tag } = Astro.props;
const articles = await getCollection("blogapi", ({ data }) =>
  tag.data.articles.includes(data.id),
);
---
<h1>{tag.data.name}</h1>
<ul>
  {articles.map((article) => (
    <li><a href={`/articles/${article.data.id}/`}>{article.data.title}</a></li>
  ))}
</ul>
```

Only materialized articles are aggregated — an article skipped for having no
thumbnail never appears in `tags.json`, so tag pages and the article
collection always agree.

## Generated files

Add the generated directories to `.gitignore`:

```
src/content/blogapi/
src/assets/blogapi/
```

To speed up CI builds, cache both directories (key them on the lockfile + this package's version). A cache hit turns the sync into a near no-op: only the API fetch runs, downloads and writes are skipped.

## Notes

- `astro dev` syncs once at startup; restart the dev server to pick up new articles.
- Markdown is written raw — configure remark/rehype plugins on the site side.

## Development

```sh
bun install
bun run build        # bundle + emit .d.ts
bun run graphqlgen   # regenerate src/graphqlgen.ts from the schema submodule
```

The GraphQL schema lives in the `.graphql/blog.miyamo.today` submodule, pinned to the same commit as the Gatsby plugin.

## License

MIT
