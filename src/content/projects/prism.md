---
title: prism
description: 'A desktop inbox for GitHub pull requests: inspect, sort and merge them in bulk.'
category: misc
order: 2
logo: ../../assets/projects/prism/logo.png
readme:
  repo: dfuchss/prism
  include: [Features, Installation]
---

[PRism](https://github.com/dfuchss/prism) collects the open GitHub pull requests you are involved in, sorts them into buckets, shows their CI and review state, and lets you review, approve and merge dependency bumps and other pull requests in bulk. Simple rules can do the routine work.

It is written in Rust on top of [Tauri v2](https://v2.tauri.app/) with a [Leptos](https://leptos.dev/) UI and runs on macOS, Linux and Windows. It uses your own GitHub sign-in through the [GitHub CLI](https://cli.github.com/); there is no server and no telemetry. PRism is GPL-3.0-or-later licensed.

![The PRism inbox with the detail pane of a pull request with failing checks](docs/screenshots/inbox.png)
