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
where you'll stand in a few months. Think _Finanzguru_, but your data stays on your computer.

## Why it's different

- **No bank connection.** No online banking access, no cloud account, no third party in between — just
  the PDF or CSV statements you can already download.
- **Everything stays on your machine.** Categorization runs locally. Importing and analyzing your data
  never touches the internet. The one thing that can — looking up current share prices — is off until
  you switch it on, and even then only sends a security's public ID, never your holdings, amounts or
  account details.
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

If you want to know what your portfolio is worth **today** rather than on the date of your last
statement, you can switch on live prices. Project Vault then looks up the current price of each share
or fund at the Frankfurt Stock Exchange and recalculates what your positions are worth.

This is the one feature that goes online, so it is off until you turn it on, per securities account,
after a dialog that tells you exactly what will happen. It only sends the identifier of the security
itself (the ISIN) — never how much you hold, what it's worth, or anything else about you. Prices are
only fetched when you press the refresh button; nothing happens in the background. Each update is
saved as its own dated snapshot that you can delete again, and your imported statement is never
touched.

## Know what's coming

Project Vault finds your recurring payments — salary, rent, subscriptions — and shows you what's fixed
each month and what's actually free to spend. You can rename or hide any of them, or add ones it couldn't
find.

From there it projects your balance six months ahead: fixed bills plus what you typically spend on top,
with a shaded range showing how much it could realistically vary — and a warning if you might run into
the red.

![Forecast](/assets/projects/project-vault/forecast.png){:width="100%" style="border-radius: 8px;"}

## Privacy

There is no bank connection, no sync, no cloud, no account and no tracking. Your data lives in one file
on your computer, and that's the only place it goes.

The single exception is live share prices, and you decide whether to use them. With them switched on,
the app asks the Frankfurt Stock Exchange for the price of a security — sending only that security's
public identifier, and only when you press refresh. Your holdings, amounts and account details stay on
your machine either way. Leave it off and the app never goes online at all.
