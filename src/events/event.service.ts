import { Inject, Injectable } from '@nestjs/common';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { GraphQLClient } from 'graphql-request';
import Event from './event.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { createHash } from 'node:crypto';
import fetch from 'node-fetch';
import JSDom from 'jsdom';

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
   * @link http://concert.ua/
   * @returns {Array} List of all events
   */
  public async findExternal() {
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

  /**
   * Get university events from the remote service by parsing the university website
   * The page structure is the following:
   * <div class="view-id-events">
   *  <div class="view-content">
   *    <div class="views-row">
   *      <article>
   *        <div class="left-box">
   *          <div>
   *            <a href="/event/1">
   *              <picture>
   *                <img src="/event/1/image.jpg" alt="Event 1" />
   *              </picture>
   *            </a>
   *          </div>
   *        </div>
   *      </article>
   *   </div>
   *  </div>
   * </div>
   *
   * Once all events URLs are fetched, the method fetches each event page to get the event details.
   * Example link: https://vnu.edu.ua/uk/events/v-konkurs-kreatyvnykh-idey-uchnivskoyi-molodi-zrobymo-volyn-krashchoyu-krok-do-vidnovlennya
   * Example page structure:
   *  <div class="event-section">
   *    <div class="event-section__left">
   *      <div id="block-snu-content">
   *        <!-->There might be some additional content here, as well as many .event-date__time divs<-->
   *        <div class="event-date__time">
   *          <div>
   *            <b>Дата початку:</b>П'ятниця, 29 грудень 2023 - 09:00
   *          </div>
   *        </div>
   *        <div class="event-date__time">
   *          <div>
   *            <b>Місцезнаходження:</b>Волинський національний університет імені Лесі Українки (просп. Волі, 13, м. Луцьк, Волинська обл., 43025)
   *         </div>
   *        </div>
   *        <!-->There might be some additional content here, as well as many .event-date__time divs<-->
   *      </div>
   *    </div>
   *  </div>
   *
   * Note, that there might be multiple .event-date__time divs, so the method should parse all of them,
   * and then filter out the ones that contain "Дата початку" and "Місцезнаходження" strings.
   *
   * The method crawls the page and returns all events
   * @link https://vnu.edu.ua/uk/event/all?page=1
   * @returns {Array} List of all university events
   */
  public async findAll() {
    const cacheKey = createHash('md5').update('internal-events').digest('hex');
    const value = await this.cacheManager.get<Event[] | null>(cacheKey);

    if (value) {
      return value;
    }

    const response = await fetch('https://vnu.edu.ua/uk/event/all?page=1').then(
      (response) => response.text(),
    );
    const dom = new JSDom.JSDOM(response);
    const events = Array.from(
      dom.window.document.querySelectorAll('.view-id-events .views-row'),
    ).map((event) => {
      const image = event.querySelector('img');
      const link = event.querySelector('a');
      const date = event.querySelector('.date-display-single');
      const city = event.querySelector('.city');
      const venue = event.querySelector('.venue');

      return {
        id: link?.getAttribute('href')?.split('/').pop(),
        name: image?.getAttribute('alt') || '',
        price: '0',
        imageUrl: image?.getAttribute('src') || '',
        date: date?.textContent || '',
        city: city?.textContent || '',
        venue: venue?.textContent || '',
        cities_ids: '',
        categories_ids: '',
      };
    });

    await Promise.all(events.map(this.enrichUniversityEvent));

    // Cache the response for 1 day
    await this.cacheManager.set(cacheKey, events, 60 * 60 * 24);

    return events;
  }

  private async enrichUniversityEvent(event: Event) {
    const eventResponse = await fetch(`https://vnu.edu.ua/${event.id}`).then(
      (r) => r.text(),
    );
    const eventDom = new JSDom.JSDOM(eventResponse);
    const doc = eventDom.window.document;
    const eventDetails = Array.from(
      doc.querySelectorAll('.event-date__time'),
    ).map((detail) => detail.textContent);

    event.date =
      eventDetails
        .find((detail) => detail.includes('Дата початку:'))
        ?.replace('Дата початку:', '') || '';
    event.venue =
      eventDetails
        .find((detail) => detail.includes('Місцезнаходження:'))
        ?.replace('Місцезнаходження:', '') || '';

    return event;
  }
}
