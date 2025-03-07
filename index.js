import { Extension, Readme, Service } from "talkops";

const extension = new Extension("OpenWeatherMap");

extension.setDockerRepository("bierdok/talkops-extension-openweathermap");

extension.setDescription(`
This Extension based on [OpenWeatherMap](https://openweathermap.org/) allows you to **get weather forecasts, nowcasts by voice in realtime**.

Features:
* Weather nowcasts
* Weather forecasts for the next 5 days
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
      "Boussoulet, France (45.0294° N, 4.1229° E)",
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

import languages from "./parameters/languages.json" assert { type: "json" };
import units from "./parameters/units.json" assert { type: "json" };
import outputs from "./parameters/outputs.json" assert { type: "json" };

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

extension.setFunctionSchemas([
  {
    name: "get_current_weather",
    description:
      "Get current weather. Don't provide scientific data except for temperature and wind unless specifically requested.",
    parameters: {
      type: "object",
      properties: {
        latitude: {
          type: "string",
          description: "The latitude of the location.",
        },
        longitude: {
          type: "string",
          description: "The longitude of the location.",
        },
      },
      required: ["latitude", "longitude"],
    },
  },
  {
    name: "get_forecast",
    description:
      "Get weather forecast for 5 days with data every 3 hours. Don't provide scientific data except for temperature and wind unless specifically requested.",
    parameters: {
      type: "object",
      properties: {
        latitude: {
          type: "string",
          description: "The latitude of the location.",
        },
        longitude: {
          type: "string",
          description: "The longitude of the location.",
        },
      },
      required: ["latitude", "longitude"],
    },
  },
]);

async function request(endpoint, latitude, longitude) {
  const parameters = {
    lat: latitude,
    lon: longitude,
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
  async function get_current_weather(latitude, longitude) {
    return await request("weather", latitude, longitude);
  },
  async function get_forecast(latitude, longitude) {
    return await request("forecast", latitude, longitude);
  },
  async function get_hourly_forecast(latitude, longitude) {
    return await request("forecast/hourly", latitude, longitude);
  },
  async function get_daily_forecast(latitude, longitude) {
    return await request("forecast/daily", latitude, longitude);
  },
]);

new Readme(process.env.README_TEMPLATE_URL, "/app/README.md", extension);
new Service(process.env.AGENT_URLS.split(","), extension);
