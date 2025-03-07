# TalkOps Extension: OpenWeatherMap
![Docker Pulls](https://img.shields.io/docker/pulls/bierdok/talkops-extension-openweathermap)

A TalkOps Extension made to work with [TalkOps](https://link.talkops.app/talkops).

This Extension based on [OpenWeatherMap](https://openweathermap.org/) allows you to **get weather forecasts, nowcasts by voice in realtime**.

Features:
* Weather nowcasts
* Weather forecasts for the next 5 days

## Installation Guide

_[TalkOps](https://link.talkops.app/install-talkops) must be installed beforehand._

* [Create an account](https://home.openweathermap.org/users/sign_up)
* [Generate an API key](https://home.openweathermap.org/api_keys)

## Integration Guide

Add the service and setup the environment variables if needed:

_compose.yml_
``` yml
name: talkops

services:
...
  talkops-extension-openweathermap:
    image: bierdok/talkops-extension-openweathermap
    environment:
      API_KEY: [your-value]
      DEFAULT_LOCATION: [your-value]
    restart: unless-stopped
```

## Environment Variables

#### API_KEY

The copied API key.

#### DEFAULT_LOCATION

The default location.
* Possible values: `New York` `Geneva, Swiss` `Boussoulet, France (45.0294° N, 4.1229° E)`

#### LANGUAGE

The language.
* Default value: `English`
* Available values: `Albanian` `Afrikaans` `Arabic` `Azerbaijani` `Basque` `Belarusian` `Bulgarian` `Catalan` `Chinese Simplified` `Chinese Traditional` `Croatian` `Czech` `Danish` `Dutch` `English` `Finnish` `French` `Galician` `German` `Greek` `Hebrew` `Hindi` `Hungarian` `Icelandic` `Indonesian` `Italian` `Japanese` `Korean` `Kurmanji (Kurdish)` `Latvian` `Lithuanian` `Macedonian` `Norwegian` `Persian (Farsi)` `Polish` `Portuguese` `Português Brasil` `Romanian` `Russian` `Serbian` `Slovak` `Slovenian` `Spanish` `Spanish` `Swedish` `Swedish` `Thai` `Turkish` `Ukrainian` `Ukrainian` `Vietnamese` `Zulu`

#### TEMPERATURE_UNIT

The temperature unit to defined unit of measurement.
* Default value: `Kelvin`
* Available values: `Celsius` `Fahrenheit` `Kelvin`

#### AGENT_URLS

A comma-separated list of WebSocket server URLs for real-time communication with specified agents.
* Default value: `ws://talkops`
* Possible values: `ws://talkops1` `ws://talkops2`
