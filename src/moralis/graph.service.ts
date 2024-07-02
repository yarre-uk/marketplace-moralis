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
    });
  }

  async query<TResult>(
    query: DocumentNode,
    variables?: unknown,
  ): Promise<TResult> {
    const result = await this.apolloClient.query({
      query: query,
      variables,
    });
    return result.data;
  }
}
