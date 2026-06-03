import { GraphQLError, type GraphQLSchema, type ValidationContext } from 'graphql';
import { createComplexityRule, fieldExtensionsEstimator, simpleEstimator } from 'graphql-query-complexity';

export function complexityRule(schema: GraphQLSchema) {
  const maxComplexity = Number(process.env.QUERY_COMPLEXITY_LIMIT ?? 150);
  return (context: ValidationContext) =>
    createComplexityRule({
      schema,
      maximumComplexity: maxComplexity,
      variables: {},
      estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
      onComplete(complexity) {
        if (complexity > maxComplexity) {
          throw new GraphQLError(`Query is too complex (${complexity}). Limit is ${maxComplexity}.`, {
            extensions: { code: 'QUERY_TOO_COMPLEX', complexity, maxComplexity }
          });
        }
      }
    })(context);
}
