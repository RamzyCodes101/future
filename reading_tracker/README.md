# Pages — Reading Tracker

A focused, offline-first reading tracker built with Flutter, aimed at the Play
Store. Built around the research-backed niche pattern of "fix a broken big
category with a tight, single-purpose app + subscription": Goodreads/
StoryGraph draw heavy complaints about clunky UI and weak stats, so this app
keeps the core loop (track what you're reading, log progress, see your stats)
simple and fast.

## Features (MVP)

- **Library shelves**: Want to Read / Reading / Finished, with per-book
  progress bars.
- **Add books**: search via the Google Books API (no API key needed) or add
  manually.
- **Book detail**: page-progress slider, star rating, status changes, and
  notes/quotes per book.
- **Stats**: books & pages read this year, current daily streak, an editable
  annual reading goal with progress bar.
- **Monetization (freemium + subscription)**:
  - Free: full tracking, up to 3 notes per book, year-to-date stats.
  - Premium (monthly/yearly subscription via Play Billing): unlimited notes,
    reading pace & trend insights, monthly/yearly breakdowns.

## Architecture

- **State management**: Riverpod (`flutter_riverpod`).
- **Storage**: local SQLite via `sqflite` (`lib/data/app_database.dart`,
  `lib/data/book_repository.dart`). Fully offline; no backend required for
  the MVP.
- **Book search**: `lib/services/book_search_service.dart` calls the public
  Google Books volumes API.
- **Monetization**: `lib/services/premium_service.dart` wraps Google Play
  Billing via the official `in_app_purchase` plugin. Product IDs
  (`reading_tracker_premium_monthly`, `reading_tracker_premium_yearly`) must
  be created in Play Console before purchases will resolve.

  ⚠️ Entitlement is currently cached locally via `shared_preferences` for a
  fast, offline-friendly UI. Before shipping, pair this with **server-side
  receipt validation** (e.g. RevenueCat, or your own backend calling the
  Play Developer API) so premium status can't be spoofed by editing local
  app storage.

## Project layout

```
lib/
  models/       Book, BookNote, ReadingSession
  data/         sqflite schema + repository
  services/     Google Books search, Play Billing wrapper, goal storage
  providers/    Riverpod providers/notifiers tying data to UI
  screens/      Library, Add Book, Book Detail, Stats, Paywall
  widgets/      Shared widgets (book tile)
```

## Running locally

This environment doesn't have the Android SDK installed, so only
`flutter analyze` / `flutter test` were run here. To build and run for real:

```bash
flutter pub get
flutter run                 # needs an Android/iOS toolchain + device/emulator
flutter build apk --release # needs the Android SDK
```

## Before publishing to Play Store

1. Create the two subscription products in Play Console matching the IDs in
   `premium_service.dart`, and set your actual prices/trial periods.
2. Add server-side purchase verification (see warning above).
3. Replace the placeholder app icon (`android/app/src/main/res/mipmap-*`)
   and splash theme with real branding.
4. Fill in a privacy policy — required for apps that use billing and network
   access (Google Books lookups) — and link it from the Play Console listing.
5. Consider adding a cloud backup/sync (e.g. Firebase) as a premium feature
   if you want cross-device support later; the MVP is intentionally
   local-only to keep scope tight.
