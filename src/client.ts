import { request } from "graphql-request";
import {
  type SourceNodesQuery,
  SourceNodesDocument,
  type SourceNodesQueryVariables,
  type InputMaybe,
} from "./graphqlgen";

export type Article = SourceNodesQuery["articles"]["edges"][number]["node"];

const PAGE_SIZE = 24;

export interface FetchAllArticlesResult {
  articles: Article[];
  pages: number;
}

export const fetchAllArticles = async (
  url: string,
  token: string,
): Promise<FetchAllArticlesResult> => {
  const articles: Article[] = [];
  let pages = 0;
  let doContinue = true;
  let after: InputMaybe<string> = null;
  while (doContinue) {
    const data: SourceNodesQuery = await request<SourceNodesQuery, SourceNodesQueryVariables>(
      url,
      SourceNodesDocument,
      {
        after: after,
        first: PAGE_SIZE,
      },
      {
        authorization: token ? `Bearer ${token}` : "",
      },
    );
    pages++;
    articles.push(...data.articles.edges.map((edge) => edge.node));
    const { hasNextPage, endCursor } = data.articles.pageInfo;
    doContinue = hasNextPage ?? false;
    after = endCursor;
  }
  return { articles, pages };
};
