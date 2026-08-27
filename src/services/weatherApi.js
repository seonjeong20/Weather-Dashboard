import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/weather',
  timeout: 7000,
})

const CITY_LIST = [
  { id: 'city_01', name: '서울', lat: 37.5665, lon: 126.978 },
  { id: 'city_02', name: '수원', lat: 37.2636, lon: 127.0286 },
  { id: 'city_03', name: '부산', lat: 35.1796, lon: 129.0756 },
]

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
  return Promise.all(
    CITY_LIST.map(async (city) => {
      const data = await requestWeather(city)
      return normalizeWeather(city, data)
    }),
  )
}

export async function fetchWeatherDetail(cityId) {
  const city = CITY_LIST.find((item) => item.id === cityId)
  if (!city) return null

  const data = await requestWeather(city)
  return normalizeWeather(city, data)
}
