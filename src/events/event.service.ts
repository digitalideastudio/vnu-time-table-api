import { Inject, Injectable } from '@nestjs/common';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { GraphQLClient } from 'graphql-request';
import Event from './event.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { createHash } from 'node:crypto';

interface RecommendationsResponse {
  recommendations: {
    products: {
      products: Event[];
      status: string;
    };
  };
}

@Injectable()
export default class EventService {
  constructor(
    @InjectGraphQLClient() private readonly client: GraphQLClient,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Get all events from the remote service concert.ua
   * The method pulls all events similar to this CLI command:
   * curl 'https://ai.esputnik.com/graphql' \
   *   -H 'content-type: application/json' \
   *   --data-raw '{"query":"{ recommendations { products(isV2: true, category: \"19\", categoryField: \"tags_categories_ids_feed\",  cookie: \"undefined\", blockId: 26399, filters: {include:[{name:\"tags_cities_ids\",values:[\"24\"]},{name:\"tags_categories_ids_feed\",values:[\"19\"]}]}) { products { url: urlWithContent(id: \"26399_r1480v1881\", delimiter: \"?\") id name price imageUrl date: tagAsString(tag: \"date_start\") city: tagAsString(tag: \"cities_titles\") venue: tagAsString(tag: \"venues_titles\") cities_ids: tagAsString(tag: \"cities_ids\") categories_ids: tagAsString(tag: \"categories_ids_feed\") } status}}}"}' | jq '.data.recommendations.products.products'
   * @returns {Array} List of all events
   */
  public async findAll() {
    const cacheKey = createHash('md5').update('events').digest('hex');
    const value = await this.cacheManager.get<Event[] | null>(cacheKey);

    if (value) {
      return value;
    }

    const response = await this.client.request<RecommendationsResponse>(
      `{
        recommendations {
          products(
            isV2: true,
            category: "19",
            categoryField: "tags_categories_ids_feed",
            cookie: "undefined",
            blockId: 26399,
            filters: {
              include: [
                { name: "tags_cities_ids", values: ["24"] },
                { name: "tags_categories_ids_feed", values: ["19"] }
              ]
            }
          ) {
            products {
              url: urlWithContent(id: "26399_r1480v1881", delimiter: "?")
              id
              name
              price
              imageUrl
              date: tagAsString(tag: "date_start")
              city: tagAsString(tag: "cities_titles")
              venue: tagAsString(tag: "venues_titles")
              cities_ids: tagAsString(tag: "cities_ids")
              categories_ids: tagAsString(tag: "categories_ids_feed")
            }
            status
          }
        }
      }`,
    );

    // Cache the response for 1 day
    await this.cacheManager.set(
      cacheKey,
      response.recommendations.products.products,
      60 * 60 * 24,
    );

    return response.recommendations.products.products;
  }
}
