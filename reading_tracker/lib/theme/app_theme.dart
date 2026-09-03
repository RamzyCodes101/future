import 'package:flutter/material.dart';

import '../models/book.dart';

/// Warm, editorial palette inspired by Aardvark Book Club's soft-yellow
/// minimalism (#FAED8F on white), pushed toward the bolder, colorful,
/// card-heavy look common on Dribbble/Pinterest reading-app boards right
/// now: cream backgrounds, a saturated CTA yellow, and a small rotating
/// set of accent colors used for book covers and status tags instead of
/// one flat brand color everywhere.
class AppColors {
  AppColors._();

  // Brand yellow family (Aardvark-inspired).
  static const yellowPale = Color(0xFFFAED8F); // Aardvark's actual brand tint
  static const yellowDeep = Color(0xFFF4B740); // saturated CTA/FAB yellow
  static const yellowDeeper = Color(0xFFE8A422);

  // Warm neutrals.
  static const cream = Color(0xFFFFF8EA);
  static const creamCard = Color(0xFFFFFDF7);
  static const ink = Color(0xFF2B2013);
  static const inkMuted = Color(0xFF8A7A63);
  static const hairline = Color(0xFFEDE1C8);

  // Status accents.
  static const coral = Color(0xFFEF7B57); // Reading
  static const periwinkle = Color(0xFF7C93D6); // Want to Read
  static const sage = Color(0xFF6E9B6B); // Finished
  static const plum = Color(0xFFA787C4); // misc / DNF

  // Dark-mode neutrals.
  static const inkDark = Color(0xFF201A10);
  static const surfaceDark = Color(0xFF2C2418);
  static const creamDark = Color(0xFFF7EEDA);

  static Color statusColor(ReadingStatus status) => switch (status) {
        ReadingStatus.reading => coral,
        ReadingStatus.wantToRead => periwinkle,
        ReadingStatus.finished => sage,
        ReadingStatus.dnf => plum,
      };

  /// Rotating accent palette for book cover placeholders — gives the
  /// library a colorful, varied bookshelf look instead of one flat tone.
  static const List<Color> coverPalette = [
    coral,
    periwinkle,
    sage,
    yellowDeeper,
    plum,
    Color(0xFF5FA8A0), // teal
  ];

  static Color coverColorFor(String bookId) {
    final index = bookId.hashCode.abs() % coverPalette.length;
    return coverPalette[index];
  }
}

class AppTheme {
  AppTheme._();

  /// [fontFamily] is a demo-only escape hatch for the web preview build,
  /// which bundles a local font instead of fetching Roboto from Google's
  /// CDN. Real Android/iOS builds never pass this.
  static ThemeData light({String? fontFamily}) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.yellowDeep,
      brightness: Brightness.light,
      primary: AppColors.yellowDeeper,
      onPrimary: AppColors.ink,
      secondary: AppColors.coral,
      surface: AppColors.creamCard,
      onSurface: AppColors.ink,
    );

    final base = ThemeData(colorScheme: colorScheme, useMaterial3: true, fontFamily: fontFamily);

    return base.copyWith(
      scaffoldBackgroundColor: AppColors.cream,
      textTheme: base.textTheme.apply(
        bodyColor: AppColors.ink,
        displayColor: AppColors.ink,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.cream,
        foregroundColor: AppColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: base.textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.w800,
          color: AppColors.ink,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.creamCard,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.hairline),
        ),
        margin: EdgeInsets.zero,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.yellowDeep,
        foregroundColor: AppColors.ink,
        elevation: 2,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.yellowDeep,
          foregroundColor: AppColors.ink,
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.coral,
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.ink,
          side: const BorderSide(color: AppColors.hairline),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.creamCard,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.hairline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.hairline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.yellowDeeper, width: 2),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.coral,
        linearTrackColor: AppColors.hairline,
        circularTrackColor: AppColors.hairline,
      ),
      dividerTheme: const DividerThemeData(color: AppColors.hairline, space: 32),
      colorScheme: colorScheme,
    );
  }

  static ThemeData dark({String? fontFamily}) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.yellowDeep,
      brightness: Brightness.dark,
      primary: AppColors.yellowDeep,
      onPrimary: AppColors.inkDark,
      secondary: AppColors.coral,
      surface: AppColors.surfaceDark,
      onSurface: AppColors.creamDark,
    );
    final base = ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: fontFamily,
    );
    return base.copyWith(
      scaffoldBackgroundColor: AppColors.inkDark,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.inkDark,
        foregroundColor: AppColors.creamDark,
        elevation: 0,
        titleTextStyle: base.textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.w800,
          color: AppColors.creamDark,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surfaceDark,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        margin: EdgeInsets.zero,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.yellowDeep,
        foregroundColor: AppColors.inkDark,
      ),
    );
  }
}
