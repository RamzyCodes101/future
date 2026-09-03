import 'package:flutter/material.dart';

import '../models/book.dart';
import '../theme/app_theme.dart';

/// Renders a book's cover: the real artwork when [Book.coverUrl] is set,
/// otherwise a designed placeholder — a colored gradient "jacket" with the
/// title set in large type, closer to how a real cover reads on a shelf
/// than a plain icon tile.
class BookCoverArt extends StatelessWidget {
  final Book book;
  final double width;
  final double height;
  final double radius;

  const BookCoverArt({
    super.key,
    required this.book,
    this.width = 56,
    this.height = 80,
    this.radius = 12,
  });

  @override
  Widget build(BuildContext context) {
    final url = book.coverUrl;
    if (url != null && url.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Image.network(
          url,
          width: width,
          height: height,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _PlaceholderCover(
            book: book,
            width: width,
            height: height,
            radius: radius,
          ),
        ),
      );
    }
    return _PlaceholderCover(book: book, width: width, height: height, radius: radius);
  }
}

class _PlaceholderCover extends StatelessWidget {
  final Book book;
  final double width;
  final double height;
  final double radius;

  const _PlaceholderCover({
    required this.book,
    required this.width,
    required this.height,
    required this.radius,
  });

  @override
  Widget build(BuildContext context) {
    final accent = AppColors.coverColorFor(book.id);
    final deep = HSLColor.fromColor(accent).withLightness(
      (HSLColor.fromColor(accent).lightness - 0.16).clamp(0.0, 1.0),
    ).toColor();

    return Container(
      width: width,
      height: height,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [accent, deep],
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            Icons.auto_stories_rounded,
            size: width * 0.4,
            color: Colors.white.withValues(alpha: 0.55),
          ),
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: Container(width: 4, color: Colors.black.withValues(alpha: 0.12)),
          ),
        ],
      ),
    );
  }
}
