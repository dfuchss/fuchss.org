---
title: atrium
description: 'A lightweight messenger aggregator for macOS, Linux and Windows: all your messengers in one calm place.'
category: misc
order: 0
logo: ../../assets/projects/atrium/logo.png
readme:
  repo: dfuchss/atrium
  include: [Features, Installation, Documentation]
---

[Atrium](https://github.com/dfuchss/atrium) puts Element, Slack, Discord, WhatsApp, Teams and any other web app into one window with a compact sidebar. Every account runs in its own isolated web view, so you can stay signed in to several accounts of the same service side by side.

It is written in Rust on top of [Tauri v2](https://v2.tauri.app/), with a [Leptos](https://leptos.dev/) UI, and uses the system's web view (WebKit on macOS, WebKitGTK on Linux, WebView2 on Windows) instead of bundling its own browser engine. On macOS, with the same services open, it needs less memory and half the processes of an Electron-based aggregator. Atrium runs on macOS 14 or newer, Linux (AppImage, x86_64 and aarch64) and Windows 10 and 11; Windows support is still in progress. It is GPL-3.0-or-later licensed and updates itself.

![Atrium with a Matrix chat open and several accounts in the sidebar](docs/screenshots/main.png)
