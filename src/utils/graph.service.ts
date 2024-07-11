import {
  ApolloClient,
  DocumentNode,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GraphQLClientService {
  private apolloClient: ApolloClient<NormalizedCacheObject>;
  constructor(private configService: ConfigService) {
    this.apolloClient = new ApolloClient({
      link: new HttpLink({
        uri: configService.get<string>('GRAPHQL_ENDPOINT'),
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'network-only',
        },
      },
    });
  }

  async query<TResult>(
    query: DocumentNode,
    variables?: unknown,
  ): Promise<TResult> {
    const result = await this.apolloClient.query({
      query: query,
      variables: variables ?? {},
    });
    return result.data;
  }
}
