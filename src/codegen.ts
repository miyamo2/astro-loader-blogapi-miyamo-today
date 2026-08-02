import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "../.graphql/**/*.graphqls",
  documents: ["../.graphql/**/*.graphql"],
  generates: {
    "./graphqlgen.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-graphql-request"],
      config: {
        skipTypename: false,
        withHOC: false,
        withComponent: false,
        scalars: {
          uniqueidentifier: "string",
        },
      },
    },
  },
};

export default config;
