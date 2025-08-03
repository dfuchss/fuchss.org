---
layout: post
title: mensabot @ TWIM
date: 2023-08-04
description: My first post on mensabot at TWIM 04.08.2023
tags: matrix
categories: projects
featured: false
---

Originally posted on [TWIM](https://matrix.org/blog/2023/08/04/this-week-in-matrix-2023-08-04/).

The [mensabot](https://github.com/dfuchss/mensabot) is a bot I created at the beginning of the year using the [trixnity](https://trixnity.gitlab.io/trixnity/) framework.
It sends a daily reminder of the food that is currently available in your canteen (German: Mensa).
You can also use commands to request the list directly.
Currently, it only supports the API of my university's canteen. However, the bot is extensible for new canteens.

#### Features

- Schedule daily posts about the food in your canteen
- Get a summary of the food in your canteen (on the current date)
- Simple rights management (only configured admins can interact with the bot)
