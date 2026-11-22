---
title: sigil
description: 'OpenPGP for Apple Mail: sign, seal and verify mail with your own GnuPG.'
category: misc
order: 3
logo: ../../assets/projects/sigil/logo.png
readme:
  repo: dfuchss/sigil
  include: [Features, Installation]
---

[Sigil](https://github.com/dfuchss/sigil) signs, encrypts, decrypts and verifies mail in Apple Mail with OpenPGP: PGP/MIME, plus inline PGP when reading. It uses your own GnuPG from Homebrew, with your keys, trust settings, gpg-agent and keyserver configuration, through a sandboxed MailKit extension and a small helper. There is no server and no telemetry.

It is written in Swift and SwiftUI, requires macOS 14 or newer and is GPL-3.0-or-later licensed. Sigil is beta software: do not rely on it for messages where a mistake would be costly.

![The Sigil app's overview with its health checklist](Docs/screenshots/overview-dark.png)
