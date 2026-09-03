import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/book.dart';
import '../providers/app_providers.dart';
import '../theme/app_theme.dart';
import '../widgets/book_tile.dart';
import 'book_detail_screen.dart';

/// Full vertical list for one shelf — reached via "See all" from the Home
/// screen's horizontally-scrolling shelf row.
class ShelfListScreen extends ConsumerWidget {
  final ReadingStatus status;
  final String title;

  const ShelfListScreen({super.key, required this.status, required this.title});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booksAsync = ref.watch(booksProvider);

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: booksAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('$err')),
        data: (books) {
          final filtered = books.where((b) => b.status == status).toList();
          if (filtered.isEmpty) {
            return const Center(
              child: Text('Nothing here yet.', style: TextStyle(color: AppColors.inkMuted)),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: filtered.length,
            itemBuilder: (context, index) {
              final book = filtered[index];
              return BookTile(
                book: book,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => BookDetailScreen(bookId: book.id)),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
