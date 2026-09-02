import 'package:flutter/material.dart';

import '../models/book.dart';

class BookTile extends StatelessWidget {
  final Book book;
  final VoidCallback onTap;

  const BookTile({super.key, required this.book, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: _Cover(url: book.coverUrl),
      title: Text(book.title, maxLines: 2, overflow: TextOverflow.ellipsis),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(book.author, maxLines: 1, overflow: TextOverflow.ellipsis),
          if (book.status == ReadingStatus.reading && book.totalPages != null) ...[
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: book.progress, minHeight: 5),
            ),
            const SizedBox(height: 2),
            Text(
              '${book.currentPage}/${book.totalPages} pages',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ],
      ),
    );
  }
}

class _Cover extends StatelessWidget {
  final String? url;
  const _Cover({this.url});

  @override
  Widget build(BuildContext context) {
    const width = 44.0;
    const height = 64.0;
    if (url == null || url!.isEmpty) {
      return Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.secondaryContainer,
          borderRadius: BorderRadius.circular(4),
        ),
        child: const Icon(Icons.menu_book, size: 20),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: Image.network(
        url!,
        width: width,
        height: height,
        fit: BoxFit.cover,
        errorBuilder: (imgContext, error, stackTrace) => Container(
          width: width,
          height: height,
          color: Theme.of(context).colorScheme.secondaryContainer,
          child: const Icon(Icons.menu_book, size: 20),
        ),
      ),
    );
  }
}
