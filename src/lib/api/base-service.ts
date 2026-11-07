import { ApiClient, globalApiClient } from './api-client';

export abstract class BaseApiService {
  protected readonly client: ApiClient;

  constructor(client: ApiClient = globalApiClient) {
    this.client = client;
  }
}
