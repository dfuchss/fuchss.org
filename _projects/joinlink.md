---
title: matrix-joinlink
description: A bot that allows the creation of Join Links to non-public Rooms in Matrix
layout: page
category: matrix
---

[matrix-joinlink](https://github.com/dfuchss/matrix-joinlink) allows the creation of join links to non-public rooms in Matrix. It uses the [trixnity](https://trixnity.gitlab.io/trixnity/) framework.

## Reason for this Bot

I often struggled with sharing private rooms with a group of friends. Before this bot, I had to invite everyone manually. Now I
can invite _matrix-joinlink_ and create a join link. This link can be shared with friends who want to join the room (including spaces).

## Setup

1. Get a matrix account for the bot (e.g., on your own homeserver or on `matrix.org`)
2. Prepare configuration:
   - Copy `config-sample.json` to `config.json`
   - Enter the `baseUrl` of the Matrix server and `username` / `password` for the bot user
   - Set an encryption key. The bot will use this string as key to encrypt the state events.
   - Add yourself (e.g., `@user:matrix.org`) or your homeserver (e.g., `:matrix.org`) to the `users` (empty == allow all). Users can interact with the bot.
   - Add yourself to the `admins` (can't be empty)
3. Either run the bot via jar or run it via the provided docker.
   - If you run it locally, you can use the environment variable `CONFIG_PATH` to point at your `config.json` (defaults to `./config.json`)
   - If you run it in docker, you can use a command similar to
     this `docker run -itd -v $LOCAL_PATH_TO_CONFIG:/usr/src/bot/data/config.json:ro ghcr.io/dfuchss/matrixjoinlink`
   - If you want to persist sessions, you should persist the data volume `-v $LOCAL_PATH_TO_DATA:/usr/src/bot/data`

## Usage

- A user (see user list in configuration file) can invite the bot to a room.
- After the bot has joined, use `!join help` to get an overview of the features of the bot (remember: the bot only responds to users in the user list)
- To create a join link, type `!join link SomeFancyNameForTheLink` and the bot will create one. Please make sure that the bot has the ability to invite users.

<img src="/assets/projects/joinlink/help.png" width="100%" alt="Help" style="border-radius: 8px;" />

### Creation of Join (Invite) Links

<img src="/assets/projects/joinlink/creation.png" width="100%" alt="Creation" style="border-radius: 8px;" />

### Entering a Join (Invite) Link Room

<img src="/assets/projects/joinlink/joined.png" width="100%" alt="Enter" style="border-radius: 8px;" />

### Unlinking a Join (Invite) Link

<img src="/assets/projects/joinlink/unlink.png" width="100%" alt="Unlink" style="border-radius: 8px;" />

## Development

I'm typically online in the [trixnity channel](https://matrix.to/#/#trixnity:imbitbu.de). So feel free to tag me there if you have any questions.

- The basic functionality is located in [Main.kt](https://github.com/dfuchss/matrix-joinlink/blob/main/src/main/kotlin/org/fuchss/matrix/joinlink/Main.kt). There you can also find the main method of the bot.

### How the bot works

1. Let's assume that you want to share the private room `!private:room.domain`
2. After you've invited the bot, you can enter `!join link IShareLinksWithYou`
3. The bot creates a new public room that contains "IShareLinksWithYou" in its name. This room will not be listed in the room directory; for this example its ID is `!public:room.domain`.
4. If somebody joins the public room, the bot verifies based on two encrypted state events in `!private:room.domain` and `!public:room.domain` whether the rooms
   belong to each other. If so, the bot simply invites the user to the private room.
5. If you want to disable the share simply type `!join unlink` in the private room. This will invalidate the join link.
