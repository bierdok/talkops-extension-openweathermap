import { Extension, Readme, Service } from "talkops";

const extension = new Extension("OpenWeatherMap");

extension.setDockerRepository("bierdok/talkops-extension-openweathermap");

extension.setDescription(`
This Extension based on [OpenWeatherMap](https://openweathermap.org/) allows you to **get weather forecasts, nowcasts by voice in realtime**.

Features:
* Current weather
* Forecasts for the next 5 days
`);

extension.setInstallationGuide(`
* [Create an account](https://home.openweathermap.org/users/sign_up)
* [Generate an API key](https://home.openweathermap.org/api_keys)
`);

extension.setEnvironmentVariables({
  API_KEY: {
    description: "The copied API key.",
  },
  DEFAULT_LOCATION: {
    description: "The default location.",
    possibleValues: [
      "New York",
      "Geneva, Swiss",
      "Paris, France",
    ],
  },
  LANGUAGE: {
    description: "The language.",
    defaultValue: "English",
    availableValues: Object.values(languages),
  },
  TEMPERATURE_UNIT: {
    description: "The temperature unit to defined unit of measurement.",
    defaultValue: "Kelvin",
    availableValues: Object.values(units),
  },
});

import axios from "axios";
import yaml from "js-yaml";

import languages from "./parameters/languages.json" with { type: "json" };
import units from "./parameters/units.json" with { type: "json" };
import outputs from "./parameters/outputs.json" with { type: "json" };

import getWeatherFunction from "./schemas/functions/get_weather.json" with { type: "json" };
import getForecastFunction from "./schemas/functions/get_forecast.json" with { type: "json" };

const api = axios.create({
  baseURL: "https://api.openweathermap.org/data/2.5/",
});

let unit = "standard";
for (let key in units) {
  if (units[key] === process.env.TEMPERATURE_UNIT) {
    unit = key;
  }
}

let language = "en";
for (let key in languages) {
  if (languages[key] !== process.env.LANGUAGE) continue;
  language = key;
}

for (let key in outputs) {
  outputs[key].unit = outputs[key].units[unit];
  delete outputs[key].units;
}

extension.setInstructions(() => {
  const instructions = [
    "Provide general weather information and offer practical advice based on current weather conditions. By default, cast temperature as integer.",
  ];

  instructions.push("``` yaml");
  instructions.push(
    yaml.dump({
      defaultLocation: process.env.DEFAULT_LOCATION,
      outputs,
    })
  );
  instructions.push("```");

  return instructions;
});

extension.setFunctionSchemas([getWeatherFunction, getForecastFunction]);

// async function requestFromGeoCoordinates(endpoint, latitude, longitude) {
//   const parameters = {
//     lat: latitude,
//     lon: longitude,
//     lang: language,
//     units: unit,
//     appid: process.env.API_KEY,
//   };
//   const url = `${endpoint}?${new URLSearchParams(parameters).toString()}`;
//   try {
//     const response = await api.get(url);
//     return response.data;
//   } catch (err) {
//     extension.errors = [err.message];
//     return "Error.";
//   }
// }

async function request(endpoint, city, state, country) {
  const location = [city];
  state && location.push(state);
  country && location.push(country);
  const parameters = {
    q: location.join(","),
    lang: language,
    units: unit,
    appid: process.env.API_KEY,
  };
  const url = `${endpoint}?${new URLSearchParams(parameters).toString()}`;
  try {
    const response = await api.get(url);
    return response.data;
  } catch (err) {
    extension.errors = [err.message];
    return "Error.";
  }
}

extension.setFunctions([
  // async function get_weather_from_geo_coordinates(latitude, longitude) {
  //   return await requestFromGeoCoordinates("weather", latitude, longitude);
  // },
  // async function get_forecast_from_geo_coordinates(latitude, longitude) {
  //   return await requestFromGeoCoordinates("forecast", latitude, longitude);
  // },
  async function get_weather(city, state, country) {
    return await request("weather", city, state, country);
  },
  async function get_forecast(city, state, country) {
    return await request("forecast", city, state, country);
  },
]);

new Readme(process.env.README_TEMPLATE_URL, "/app/README.md", extension);
new Service(process.env.AGENT_URLS.split(","), extension);
