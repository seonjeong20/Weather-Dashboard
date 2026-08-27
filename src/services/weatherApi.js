import axios from 'axios'
import { DEFAULT_CITIES } from '@/data/defaultCities'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/weather',
  timeout: 7000,
})

const geocodingClient = axios.create({
  baseURL: 'https://api.openweathermap.org/geo/1.0/direct',
  timeout: 7000,
})

function assertApiKey() {
  if (!API_KEY) {
    throw new Error('VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.')
  }
}

async function requestWeather(city) {
  assertApiKey()

  const { data } = await weatherClient.get('', {
    params: {
      lat: city.lat,
      lon: city.lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })
  return data
}

function normalizeWeather(city, data) {
  return {
    id: city.id,
    name: city.name,
    temp: data.main.temp,
    status: data.weather?.[0]?.description ?? '정보 없음',
    humidity: data.main.humidity,
    wind: data.wind.speed,
  }
}

export async function fetchWeatherList() {
  const results = await Promise.allSettled(
    DEFAULT_CITIES.map(async (city) => {
      const data = await requestWeather(city)
      return normalizeWeather(city, data)
    }),
  )

  const weatherList = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)

  if (weatherList.length === 0) {
    throw new Error('모든 도시의 날씨 요청에 실패했습니다.')
  }

  return weatherList
}

export async function fetchWeatherDetail(cityId) {
  const city = DEFAULT_CITIES.find((item) => item.id === cityId)
  if (!city) return null

  const data = await requestWeather(city)
  return normalizeWeather(city, data)
}

export async function searchCityWeather(cityName) {
  assertApiKey()

  const query = cityName.trim()
  if (!query) return null

  const queryCandidates = /[시군구]$/.test(query)
    ? [query]
    : [query, `${query}시`, `${query}군`, `${query}구`]

  const locationResponses = await Promise.all(
    queryCandidates.map((candidate) =>
      geocodingClient.get('', {
        params: {
          q: `${candidate},KR`,
          limit: 1,
          appid: API_KEY,
        },
      }),
    ),
  )

  const location = locationResponses
    .flatMap((response) => response.data)
    .find((item) => item.country === 'KR')
  if (!location) return null

  const city = {
    id: `geo_${location.lat}_${location.lon}`,
    name: location.local_names?.ko ?? location.name,
    lat: location.lat,
    lon: location.lon,
  }

  const weatherData = await requestWeather(city)
  return normalizeWeather(city, weatherData)
}
