import 'package:flutter/material.dart';

import '../models/book.dart';
import '../theme/app_theme.dart';

class BookTile extends StatelessWidget {
  final Book book;
  final VoidCallback onTap;

  const BookTile({super.key, required this.book, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final accent = AppColors.coverColorFor(book.id);
    final statusColor = AppColors.statusColor(book.status);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Material(
        color: AppColors.creamCard,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.hairline),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Cover(url: book.coverUrl, accent: accent),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        book.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, height: 1.2),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        book.author,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: AppColors.inkMuted, fontSize: 13.5),
                      ),
                      const SizedBox(height: 10),
                      if (book.status == ReadingStatus.reading && book.totalPages != null) ...[
                        ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: LinearProgressIndicator(
                            value: book.progress,
                            minHeight: 7,
                            backgroundColor: AppColors.hairline,
                            valueColor: AlwaysStoppedAnimation(statusColor),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${book.currentPage}/${book.totalPages} pages',
                          style: TextStyle(color: AppColors.inkMuted, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ] else
                        _StatusChip(status: book.status, color: statusColor),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final ReadingStatus status;
  final Color color;
  const _StatusChip({required this.status, required this.color});

  @override
  Widget build(BuildContext context) {
    final label = switch (status) {
      ReadingStatus.wantToRead => 'Want to read',
      ReadingStatus.reading => 'Reading',
      ReadingStatus.finished => 'Finished',
      ReadingStatus.dnf => 'Did not finish',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }
}

class _Cover extends StatelessWidget {
  final String? url;
  final Color accent;
  const _Cover({this.url, required this.accent});

  @override
  Widget build(BuildContext context) {
    const width = 56.0;
    const height = 80.0;
    if (url == null || url!.isEmpty) {
      return Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: accent.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(Icons.menu_book_rounded, size: 24, color: accent),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.network(
        url!,
        width: width,
        height: height,
        fit: BoxFit.cover,
        errorBuilder: (imgContext, error, stackTrace) => Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: accent.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(Icons.menu_book_rounded, size: 24, color: accent),
        ),
      ),
    );
  }
}
