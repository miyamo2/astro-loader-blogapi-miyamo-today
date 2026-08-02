import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Markdown: any;
  URL: any;
  Upload: any;
};

export type ArticleConnection = {
  __typename?: 'ArticleConnection';
  edges: Array<ArticleEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ArticleEdge = {
  __typename?: 'ArticleEdge';
  cursor: Scalars['String'];
  node: ArticleNode;
};

export type ArticleNode = Node & {
  __typename?: 'ArticleNode';
  content: Scalars['Markdown'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  tags: ArticleTagConnection;
  thumbnailUrl: Scalars['URL'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


export type ArticleNodeTagsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type ArticleTagConnection = {
  __typename?: 'ArticleTagConnection';
  edges: Array<ArticleTagEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ArticleTagEdge = {
  __typename?: 'ArticleTagEdge';
  cursor: Scalars['String'];
  node: ArticleTagNode;
};

export type ArticleTagNode = {
  __typename?: 'ArticleTagNode';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type AttachTagsInput = {
  articleId: Scalars['ID'];
  clientMutationId?: InputMaybe<Scalars['String']>;
  tagNames: Array<Scalars['String']>;
};

export type AttachTagsPayload = {
  __typename?: 'AttachTagsPayload';
  articleId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
  eventID: Scalars['ID'];
};

export type CreateArticleInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  content: Scalars['String'];
  tagNames: Array<Scalars['String']>;
  thumbnailURL: Scalars['URL'];
  title: Scalars['String'];
};

export type CreateArticlePayload = {
  __typename?: 'CreateArticlePayload';
  articleId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
  eventID: Scalars['ID'];
};

export type DetachTagsInput = {
  articleId: Scalars['ID'];
  clientMutationId?: InputMaybe<Scalars['String']>;
  tagNames: Array<Scalars['String']>;
};

export type DetachTagsPayload = {
  __typename?: 'DetachTagsPayload';
  articleId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
  eventID: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  attachTags: AttachTagsPayload;
  createArticle: CreateArticlePayload;
  detachTags: DetachTagsPayload;
  noop?: Maybe<NoopPayload>;
  updateArticleBody: UpdateArticleBodyPayload;
  updateArticleThumbnail: UpdateArticleThumbnailPayload;
  updateArticleTitle: UpdateArticleTitlePayload;
  uploadImage: UploadImagePayload;
};


export type MutationAttachTagsArgs = {
  input: AttachTagsInput;
};


export type MutationCreateArticleArgs = {
  input: CreateArticleInput;
};


export type MutationDetachTagsArgs = {
  input: DetachTagsInput;
};


export type MutationNoopArgs = {
  input?: InputMaybe<NoopInput>;
};


export type MutationUpdateArticleBodyArgs = {
  input: UpdateArticleBodyInput;
};


export type MutationUpdateArticleThumbnailArgs = {
  input: UpdateArticleThumbnailInput;
};


export type MutationUpdateArticleTitleArgs = {
  input: UpdateArticleTitleInput;
};


export type MutationUploadImageArgs = {
  input: UploadImageInput;
};

export type Node = {
  id: Scalars['ID'];
};

export type NoopInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
};

export type NoopPayload = {
  __typename?: 'NoopPayload';
  clientMutationId?: Maybe<Scalars['String']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Scalars['String'];
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']>;
  startCursor: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  article?: Maybe<ArticleNode>;
  articles: ArticleConnection;
  node?: Maybe<Node>;
  tag?: Maybe<TagNode>;
  tags: TagConnection;
};


export type QueryArticleArgs = {
  id: Scalars['ID'];
};


export type QueryArticlesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};


export type QueryTagArgs = {
  id: Scalars['ID'];
};


export type QueryTagsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type TagArticleConnection = {
  __typename?: 'TagArticleConnection';
  edges: Array<TagArticleEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type TagArticleEdge = {
  __typename?: 'TagArticleEdge';
  cursor: Scalars['String'];
  node: TagArticleNode;
};

export type TagArticleNode = Node & {
  __typename?: 'TagArticleNode';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  thumbnailUrl: Scalars['URL'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type TagConnection = {
  __typename?: 'TagConnection';
  edges: Array<TagEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type TagEdge = {
  __typename?: 'TagEdge';
  cursor: Scalars['String'];
  node: TagNode;
};

export type TagNode = {
  __typename?: 'TagNode';
  articles: TagArticleConnection;
  id: Scalars['ID'];
  name: Scalars['String'];
};


export type TagNodeArticlesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type UpdateArticleBodyInput = {
  articleId: Scalars['ID'];
  clientMutationId?: InputMaybe<Scalars['String']>;
  content: Scalars['String'];
};

export type UpdateArticleBodyPayload = {
  __typename?: 'UpdateArticleBodyPayload';
  articleId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
  eventID: Scalars['ID'];
};

export type UpdateArticleThumbnailInput = {
  articleId: Scalars['ID'];
  clientMutationId?: InputMaybe<Scalars['String']>;
  thumbnailURL: Scalars['URL'];
};

export type UpdateArticleThumbnailPayload = {
  __typename?: 'UpdateArticleThumbnailPayload';
  articleId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
  eventID: Scalars['ID'];
};

export type UpdateArticleTitleInput = {
  articleId: Scalars['ID'];
  clientMutationId?: InputMaybe<Scalars['String']>;
  title: Scalars['String'];
};

export type UpdateArticleTitlePayload = {
  __typename?: 'UpdateArticleTitlePayload';
  articleId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
  eventID: Scalars['ID'];
};

export type UploadImageInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  image: Scalars['Upload'];
};

export type UploadImagePayload = {
  __typename?: 'UploadImagePayload';
  clientMutationId?: Maybe<Scalars['String']>;
  imageURL: Scalars['URL'];
};

export type SourceNodesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
}>;


export type SourceNodesQuery = { __typename?: 'Query', articles: { __typename?: 'ArticleConnection', edges: Array<{ __typename?: 'ArticleEdge', node: { __typename?: 'ArticleNode', id: string, title: string, thumbnailUrl: any, content: any, createdAt: any, updatedAt: any, tags: { __typename?: 'ArticleTagConnection', edges: Array<{ __typename?: 'ArticleTagEdge', cursor: string, node: { __typename?: 'ArticleTagNode', name: string } }> } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, endCursor: string } } };


export const SourceNodesDocument = gql`
    query SourceNodes($first: Int, $after: String) {
  articles(first: $first, after: $after) {
    edges {
      node {
        id
        title
        thumbnailUrl
        content
        createdAt
        updatedAt
        tags {
          edges {
            cursor
            node {
              name
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    SourceNodes(variables?: SourceNodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SourceNodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SourceNodesQuery>(SourceNodesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SourceNodes', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;