import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import SharedService from '../shared/shared.service';
import { createHash } from 'node:crypto';

// Interfaces for the weather data structure
interface MainDetails {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Clouds {
  all: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

interface Precipitation {
  '3h'?: number;
}

interface SystemDetails {
  pod: string;
}

interface WeatherForecast {
  dt: number;
  main: MainDetails;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  rain?: Precipitation;
  snow?: Precipitation;
  sys: SystemDetails;
  dt_txt: string;
}

interface OpenWeatherMapResponse {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherForecast[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

type GrowToSize<T, N extends number, A extends T[]> = A['length'] extends N
  ? A
  : GrowToSize<T, N, [...A, T]>;

type FixedArray<T, N extends number> = GrowToSize<T, N, []>;

type DayOfMonthForecasts = FixedArray<
  FixedArray<WeatherForecast, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>,
  6
>;

export interface WeatherResponse {
  current: WeatherForecast;
  daily: DayOfMonthForecasts;
}

const OPENWEATHER_API_KEY =
  process.env.OPENWEATHER_API_KEY || '849338767c0e95025b5559533d26b7c4';

@Injectable()
export default class WeatherService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly sharedService: SharedService,
  ) {}

  /**
   * Fetch the weather forecast for a given location
   *
   * @param lat
   * @param long
   * @param lang
   */
  public async getForecast(lat: number, long: number, lang: string) {
    const forecastUrl = this.buildForecastUrl(lat, long, lang);
    // Cache key is a hash of the input parameters (location, language)
    const cacheKey = createHash('md5')
      .update(`${lat}-${long}-${lang}`)
      .digest('hex');
    const value = await this.cacheManager.get<WeatherResponse | null>(cacheKey);

    if (value) {
      return value;
    }

    const forecast = (await fetch(forecastUrl).then((response) =>
      response.json(),
    )) as OpenWeatherMapResponse;
    const dailyForecast = this.partitionForecastsByDay(forecast);

    const response = {
      current: dailyForecast[0][0],
      daily: dailyForecast,
    };

    await this.cacheManager.set(cacheKey, response, 60 * 60 * 1000); // 1 hour

    return response;
  }

  /**
   * Fetch the weather forecast for a given location and build a suggestion based on it
   *
   * @param lat
   * @param long
   * @param lang
   * @param studentId
   */
  public async getForecastSuggestion(
    lat: number,
    long: number,
    lang: string,
    studentId: number,
  ) {
    const forecast = await this.getForecast(lat, long, 'en');
    const currentYYMMDD = new Date().toISOString().slice(0, 10);

    return this.generateWeatherImage(
      forecast.daily[0],
      `${studentId}-${currentYYMMDD}`,
    );
  }

  /**
   * Build the URL for fetching the weather forecast
   *
   * @param lat
   * @param long
   * @param lang
   */
  private buildForecastUrl(lat: number, long: number, lang: string) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&APPID=${OPENWEATHER_API_KEY}&units=metric&lang=${lang}`;
  }

  /**
   * Partition the weather forecasts by the day of the month
   *
   * @param response
   */
  private partitionForecastsByDay(
    response: OpenWeatherMapResponse,
  ): DayOfMonthForecasts {
    const forecastsByDay: DayOfMonthForecasts = Array.from({ length: 6 }, () =>
      Array.from({ length: 0 }),
    ) as DayOfMonthForecasts;
    let dayOfMonthIndex: 0 | 1 | 2 | 3 | 4 | 5 = 0;

    response.list.forEach((forecast, index) => {
      const date = new Date(forecast.dt * 1000); // Convert UNIX timestamp to JavaScript Date
      const dayOfMonth = date.getDate();

      if (
        index !== 0 &&
        dayOfMonth !== new Date(response.list[index - 1].dt * 1000).getDate()
      ) {
        dayOfMonthIndex++;
      }

      forecastsByDay[dayOfMonthIndex].push(forecast);
    });

    return forecastsByDay;
  }

  /**
   * Build an AI suggestion based on the weather forecast
   *
   * @param hourlyForecasts
   * @param key
   * @private
   */
  private async generateWeatherImage(
    hourlyForecasts: WeatherForecast[],
    key: string,
  ): Promise<string> {
    // Example query:
    /**
     * Реалістичне якісне HD фото для студента для цієї погоди:
     *
     * Зараз на годиннику 10:46
     * Сьогодні додаток показує наступу погоду по годинах:
     * 11:00: 18°С, ясно, вітер 1.99 м/с
     * 14:00: 20°С, ясно, вітер 2.21 м/с
     * 17:00: 18°С, легкі хмари, вітер 1.03 м/с
     * 20:00: 14°С, дощ, вітер 2.29 м/с
     * 23:00: 12°С, ясно, вітер 1.85 м/с
     *
     * Дай пораду одним коротким реченням дружелюбним веселим тоном.
     */
    const weatherSet = new Set<string>();
    let forecastString = `Cityscape in different weather: `;

    const celsiusToName = (celsius: number) => {
      if (celsius < 0) {
        return 'cold';
      } else if (celsius < 10) {
        return 'cool';
      } else if (celsius < 20) {
        return 'warm';
      } else {
        return 'hot';
      }
    };
    const windToName = (speed: number) => {
      if (speed < 1) {
        return 'calm';
      } else if (speed < 5) {
        return 'light';
      } else if (speed < 10) {
        return 'moderate';
      } else {
        return 'strong';
      }
    };

    hourlyForecasts.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const temperature = forecast.main.temp;
      const description = forecast.weather[0].description;
      const windSpeed = forecast.wind.speed;

      weatherSet.add(celsiusToName(temperature));
      weatherSet.add(description);
      weatherSet.add(`wind ${windToName(windSpeed)}`);
    });

    forecastString += Array.from(weatherSet).join(', ');

    try {
      console.log(`Generating weather image for ${forecastString}`);
      return await this.sharedService.getAIImageResponse(forecastString);
    } catch (e: any) {
      console.error(`Error generating weather image for ${key}: ${e.message}`);
      return '';
    }
  }
}
