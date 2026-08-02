import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { format } from "@formkit/tempo";
import { stringify } from "yaml";
import { type Article, fetchAllArticles } from "./client";

export interface SyncLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface SyncOptions {
  /** GraphQL endpoint of blogapi.miyamo.today */
  url: string;
  /** Bearer token for the endpoint */
  token: string;
  /** Absolute path of the directory where `.md` files are written */
  contentDir: string;
  /** Absolute path of the directory where thumbnail images are written */
  assetsDir: string;
  logger?: SyncLogger;
}

export interface SyncResult {
  /** number of articles returned by the API */
  fetched: number;
  /** articles skipped because they have no thumbnail */
  withoutThumbnail: number;
  /** `.md` files written (new or changed) */
  written: number;
  /** `.md` files left untouched because the content was identical */
  unchanged: number;
  /** thumbnail images downloaded */
  downloaded: number;
  /** stale files removed by GC */
  removed: number;
}

const consoleLogger: SyncLogger = {
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message),
};

const extensionByContentType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

const sanitizeId = (id: string): string => id.replace(/[^a-zA-Z0-9._-]/g, "_");

const urlHash = (url: string): string =>
  createHash("sha256").update(url).digest("hex").slice(0, 8);

const extensionFromUrl = (url: string): string => {
  try {
    const ext = path.posix.extname(new URL(url).pathname).toLowerCase();
    if (Object.values(extensionByContentType).includes(ext)) return ext;
    if (ext === ".jpeg") return ".jpg";
  } catch {
    // fall through
  }
  return "";
};

/**
 * Downloads the thumbnail unless a file for the same article id and the same
 * source URL already exists. The source URL hash is embedded in the file name
 * (`{id}.{urlHash}{ext}`) so a changed URL invalidates the cached image.
 */
const ensureThumbnail = async (
  article: Article,
  assetsDir: string,
  existingAssets: string[],
): Promise<{ fileName: string; downloaded: boolean }> => {
  const id = sanitizeId(article.id);
  const hash = urlHash(article.thumbnailUrl);
  const prefix = `${id}.${hash}`;

  const cached = existingAssets.find((name) => name.startsWith(`${prefix}.`));
  if (cached) {
    return { fileName: cached, downloaded: false };
  }

  const response = await fetch(article.thumbnailUrl);
  if (!response.ok) {
    throw new Error(
      `failed to download thumbnail for article ${article.id}: ${response.status} ${response.statusText} (${article.thumbnailUrl})`,
    );
  }
  const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = extensionByContentType[contentType] ?? extensionFromUrl(article.thumbnailUrl) ?? ".jpg";
  const fileName = `${prefix}${ext === "" ? ".jpg" : ext}`;
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(assetsDir, fileName), buffer);
  return { fileName, downloaded: true };
};

const frontmatter = (article: Article, thumbnailPath: string): string =>
  stringify({
    id: article.id,
    title: article.title,
    createdAt: format(new Date(article.createdAt), "YYYY-MM-DDTHH:mm:ssZ"),
    updatedAt: format(new Date(article.updatedAt), "YYYY-MM-DDTHH:mm:ssZ"),
    thumbnail: thumbnailPath,
    tags: article.tags.edges.map((edge) => ({
      id: edge.cursor,
      name: edge.node.name,
    })),
  });

/**
 * Fetches all articles from blogapi.miyamo.today and materializes them as
 * `.md` files with YAML frontmatter plus locally downloaded thumbnails.
 * Unchanged files are skipped, and files for articles that no longer exist
 * are removed, so a cached output directory converges to the API state.
 */
export const sync = async (options: SyncOptions): Promise<SyncResult> => {
  const logger = options.logger ?? consoleLogger;
  const { url, token, contentDir, assetsDir } = options;

  await mkdir(contentDir, { recursive: true });
  await mkdir(assetsDir, { recursive: true });

  const { articles, pages } = await fetchAllArticles(url, token);
  logger.info(`fetched ${articles.length} articles in ${pages} page(s)`);

  const existingAssets = await readdir(assetsDir);
  const result: SyncResult = {
    fetched: articles.length,
    withoutThumbnail: 0,
    written: 0,
    unchanged: 0,
    downloaded: 0,
    removed: 0,
  };
  const expectedContents = new Set<string>();
  const expectedAssets = new Set<string>();

  await Promise.all(
    articles.map(async (article) => {
      if (
        article.thumbnailUrl === null ||
        article.thumbnailUrl === undefined ||
        article.thumbnailUrl.length === 0
      ) {
        result.withoutThumbnail++;
        return;
      }

      const { fileName, downloaded } = await ensureThumbnail(article, assetsDir, existingAssets);
      if (downloaded) result.downloaded++;
      expectedAssets.add(fileName);

      const mdName = `${sanitizeId(article.id)}.md`;
      expectedContents.add(mdName);
      const mdPath = path.join(contentDir, mdName);
      const thumbnailPath = path
        .relative(contentDir, path.join(assetsDir, fileName))
        .split(path.sep)
        .join("/");

      const rawContent = article.content.replaceAll(`\\n`, `\n`);
      const content = `---\n${frontmatter(article, thumbnailPath)}---\n${rawContent}`;

      const existing = await readFile(mdPath, "utf-8").catch(() => null);
      if (existing === content) {
        result.unchanged++;
        return;
      }
      await writeFile(mdPath, content, "utf-8");
      result.written++;
    }),
  );

  // GC: drop files whose article no longer exists (or whose thumbnail URL changed)
  const staleContents = (await readdir(contentDir)).filter(
    (name) => name.endsWith(".md") && !expectedContents.has(name),
  );
  const staleAssets = (await readdir(assetsDir)).filter((name) => !expectedAssets.has(name));
  for (const name of staleContents) {
    await unlink(path.join(contentDir, name));
    result.removed++;
  }
  for (const name of staleAssets) {
    await unlink(path.join(assetsDir, name));
    result.removed++;
  }

  logger.info(
    `sync done: ${result.written} written, ${result.unchanged} unchanged, ` +
      `${result.downloaded} downloaded, ${result.withoutThumbnail} without thumbnail, ` +
      `${result.removed} removed`,
  );
  return result;
};
