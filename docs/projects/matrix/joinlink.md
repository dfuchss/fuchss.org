---
title: JoinLink
description: A bot that can create JoinLinks for non-public matrix rooms
sidebar_position: 0
displayed_sidebar: rootSidebar
# hide_table_of_contents: true
---

# [JoinLink](https://github.com/dfuchss/MatrixJoinLink)
This bot allows the creation of JoinLinks to rooms.

## Usage

* A user (see user list) can invite the bot to a room.
* After the bot has joined use `!join help` to get an overview about the features of the bot (remember: the bot only respond to users in the user list)
* In order to create a Join Link simply type `!join link SomeFancyNameForTheLink` and the bot will create a join link. Please make sure that the bot has the ability to invite users.

## Development

Join our discussion at our matrix channel [#matrixjoinlink:fuchss.org](https://matrix.to/#/#matrixjoinlink:fuchss.org)

* The basic functionality (commands) are located in [Main.kt](src/main/kotlin/org/fuchss/matrix/joinlink/Main.kt). There you can also find the main method of
  the program.

### How does the bot work

1. Let's assume you have a private room with id `!private:room.domain`
2. You invite the bot and enter `!join link SomeFancyNameForTheLink`. This will create a new public room with a random id (not listed in the room directory). We call this
   room `!public123:room.domain`.
3. The bot saves two state events: First in `!private:room.domain` a state called `org.fuchss.matrix.joinlink` that contains a pointer to the public room.
   Second, a state called `org.fuchss.matrix.room_to_join` in the public room that contains pointers to the private room to join.
4. If someone joins the public room, the bot reads the protected state from the public room and invites the user to all roomIds that are present in the state.
5. If you want to invalidate the join link, you can simply type `!join unlink`.