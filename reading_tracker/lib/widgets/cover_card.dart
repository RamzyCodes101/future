import 'package:flutter/material.dart';

import '../models/book.dart';
import '../theme/app_theme.dart';
import 'book_cover_art.dart';

/// A shelf-style card: a portrait cover with the title/author underneath.
/// Used in the horizontally-scrolling shelves on the Home screen.
class CoverCard extends StatelessWidget {
  final Book book;
  final VoidCallback onTap;
  static const double width = 128;

  const CoverCard({super.key, required this.book, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: width,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BookCoverArt(book: book, width: width, height: 182, radius: 16),
            const SizedBox(height: 8),
            Text(
              book.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, height: 1.2),
            ),
            const SizedBox(height: 2),
            Text(
              book.author,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.inkMuted, fontSize: 11.5),
            ),
            if (book.status == ReadingStatus.reading && book.totalPages != null) ...[
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: LinearProgressIndicator(
                  value: book.progress,
                  minHeight: 5,
                  backgroundColor: AppColors.hairline,
                  valueColor: const AlwaysStoppedAnimation(AppColors.coral),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
