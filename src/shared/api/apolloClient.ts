import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/graphql`,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      FlightOption: {
        keyFields: ['id'],
      },
    },
  }),
});
