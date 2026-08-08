---
title: project-vault
description: A local-first, privacy-first personal finance analyzer for the desktop.
layout: page
category: misc
---

![Logo](/assets/projects/project-vault/logo.png){:width="150px"}

[Project Vault](https://github.com/dfuchss/project-vault) helps you understand your money — **without
ever connecting to your bank**. You import the statements your bank already gives you, everything is
sorted into categories **on your own machine**, and you get a clear picture of where your money goes and
where you'll stand in a few months. Think _Finanzguru_, but nothing ever leaves your computer.

## Why it's different

- **No bank connection.** No online banking access, no cloud account, no third party in between — just
  the PDF or CSV statements you can already download.
- **Everything stays on your machine.** Categorization runs locally. The app makes no network calls to
  import or analyze your data.
- **One file you own.** Accounts, transactions, categories and everything you've taught the app live in a
  single vault file that you can back up, move to another computer, or delete.
- **Made for households.** Several people, shared accounts, and a filter to look at just one person's
  finances.
- **A real desktop app.** No browser tab, no server, no subscription. It's free and open source.

## See where your money goes

The dashboard gives you net worth, income and expenses for any month, spending broken down by category,
and how your cash flow developed over time.

![Dashboard](/assets/projects/project-vault/dashboard.png){:width="100%" style="border-radius: 8px;"}

## Import your statements

Drop in the statements you downloaded from your bank — PDFs or CSV exports, several at once — and review
what was read before anything is saved.

- Works with **DKB** current accounts, savings accounts and credit cards, and **ING** securities accounts.
  More banks can be added.
- **Nothing gets filed in the wrong place**: a credit-card statement can't accidentally land in your
  current account.
- **Checks the numbers**: opening balance plus all transactions has to add up to the closing balance on
  the statement.
- **No duplicates**, even if statements overlap or you import the same period twice — or import the CSV
  first and the bank's PDF later.
- **Nothing is permanent**: every import can be undone again, removing exactly the entries it added.

![Transactions](/assets/projects/project-vault/transactions.png){:width="100%" style="border-radius: 8px;"}

Every transaction remembers where it came from — which file, which statement period, when it was
imported.

## Categories that learn from you

Common merchants are recognized out of the box. For everything else the app suggests a category, marked
clearly as a suggestion — you accept it or dismiss it, it's never decided behind your back.

When you correct something, it learns: it can apply your choice to that merchant's other transactions,
but only after asking. Anything you set by hand stays exactly as you set it.

## Your investments

Securities accounts are tracked as dated snapshots of your holdings, with market values — so you can see
how your portfolio developed.

![Depot](/assets/projects/project-vault/depot.png){:width="100%" style="border-radius: 8px;"}

## Know what's coming

Project Vault finds your recurring payments — salary, rent, subscriptions — and shows you what's fixed
each month and what's actually free to spend. You can rename or hide any of them, or add ones it couldn't
find.

From there it projects your balance six months ahead: fixed bills plus what you typically spend on top,
with a shaded range showing how much it could realistically vary — and a warning if you might run into
the red.

![Forecast](/assets/projects/project-vault/forecast.png){:width="100%" style="border-radius: 8px;"}

## Privacy

There is no bank connection, no sync and no cloud. Your data lives in one file on your computer, and
that's the only place it goes.
