---
layout: page
category: matrix
title: yarb
description: Yet Another Reminder Bot
---

[yarb](https://github.com/dfuchss/yarb) lets you create same-day reminders at specific times. It uses the [trixnity](https://trixnity.gitlab.io/trixnity/) framework.

## Features

- Create reminders for a specific time on the current day.
- Change the display name per room.
- Configure an offset for the reminder time.
- Simple rights management (same as my other bots).

<img src="/assets/projects/yarb/functions.png" width="100%" alt="Functions" style="border-radius: 8px;" />

## Setup

1. Get a matrix account for the bot (e.g., on your own homeserver or on `matrix.org`)
2. Prepare configuration:
   - Copy `config-sample.json` to `config.json`
   - Enter `baseUrl` to the matrix server and `username` / `password` for the bot user
   - Add yourself to the `admins` (and delete my account from the list :))
   - You can limit the users that can interact with the bot by defining the `users` list
3. Either run the bot via the JAR or use the provided Docker image.
   - If you run it locally, set the environment variable `CONFIG_PATH` to your `config.json` (defaults to `./config.json`).
   - If you run it with Docker, use a command similar to: `docker run -itd -v $LOCAL_PATH_TO_CONFIG:/usr/src/bot/data/config.json:ro ghcr.io/dfuchss/yarb`

## Usage

- An admin can invite the bot to an _unencrypted_ room. If the room uses encryption or the inviter is not an admin, the bot silently ignores the invite.
- After the bot has joined, use `!yarb help` to get an overview of its features (it only responds to users allowed in the configuration).
- To create a new reminder use `!yarb <HH:mm> <message>`. Example: `!yarb 12:00 Lunch time!`.
- Configure the bot's display name in `config.json`.

## Development

I'm typically online in the [trixnity channel](https://matrix.to/#/#trixnity:imbitbu.de). So feel free to tag me there if you have any questions.

- The bot is built using the [trixnity](https://trixnity.gitlab.io/trixnity/) framework.
- The basic functionality is located in [Main.kt](https://github.com/dfuchss/yarb/blob/main/src/main/kotlin/org/fuchss/matrix/yarb/Main.kt). There you can also find the main method of the program.
