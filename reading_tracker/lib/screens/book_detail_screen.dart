import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../models/book.dart';
import '../models/note.dart';
import '../providers/app_providers.dart';
import 'paywall_screen.dart';

/// Free tier caps notes/quotes per book; premium unlocks unlimited notes.
const int kFreeNoteLimit = 3;

class BookDetailScreen extends ConsumerWidget {
  final String bookId;
  const BookDetailScreen({super.key, required this.bookId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booksAsync = ref.watch(booksProvider);

    return booksAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (err, _) => Scaffold(body: Center(child: Text('$err'))),
      data: (books) {
        final book = books.where((b) => b.id == bookId).firstOrNull;
        if (book == null) {
          return const Scaffold(body: Center(child: Text('Book not found')));
        }
        return _BookDetailBody(book: book);
      },
    );
  }
}

class _BookDetailBody extends ConsumerStatefulWidget {
  final Book book;
  const _BookDetailBody({required this.book});

  @override
  ConsumerState<_BookDetailBody> createState() => _BookDetailBodyState();
}

class _BookDetailBodyState extends ConsumerState<_BookDetailBody> {
  late int _pageValue = widget.book.currentPage;

  @override
  void didUpdateWidget(covariant _BookDetailBody oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.book.currentPage != widget.book.currentPage) {
      _pageValue = widget.book.currentPage;
    }
  }

  Future<void> _deleteBook() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove book?'),
        content: Text('This removes "${widget.book.title}" and its notes.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Remove')),
        ],
      ),
    );
    if (confirmed != true) return;
    await ref.read(booksProvider.notifier).delete(widget.book.id);
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  Future<void> _addNote(bool isPremium) async {
    final notes = ref.read(notesProvider(widget.book.id)).valueOrNull ?? [];
    if (!isPremium && notes.length >= kFreeNoteLimit) {
      final go = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Note limit reached'),
          content: Text('Free plan is limited to $kFreeNoteLimit notes per book. Go Premium for unlimited notes.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Not now')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Go Premium')),
          ],
        ),
      );
      if (go == true && mounted) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PaywallScreen()));
      }
      return;
    }

    final controller = TextEditingController();
    final content = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add note'),
        content: TextField(
          controller: controller,
          maxLines: 4,
          autofocus: true,
          decoration: const InputDecoration(hintText: 'A quote, thought, or reminder...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (content == null || content.isEmpty) return;
    await ref.read(notesProvider(widget.book.id).notifier).add(
          BookNote(
            id: const Uuid().v4(),
            bookId: widget.book.id,
            content: content,
            page: _pageValue,
            createdAt: DateTime.now(),
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    final book = widget.book;
    final notesAsync = ref.watch(notesProvider(book.id));
    final isPremium = ref.watch(isPremiumProvider).valueOrNull ?? false;
    final maxPages = book.totalPages ?? 1;

    return Scaffold(
      appBar: AppBar(
        title: Text(book.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(icon: const Icon(Icons.delete_outline), onPressed: _deleteBook),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(book.author, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 16),
          DropdownButtonFormField<ReadingStatus>(
            initialValue: book.status,
            decoration: const InputDecoration(labelText: 'Status', border: OutlineInputBorder()),
            items: ReadingStatus.values
                .map((s) => DropdownMenuItem(value: s, child: Text(_statusLabel(s))))
                .toList(),
            onChanged: (status) {
              if (status == null) return;
              ref.read(booksProvider.notifier).upsert(book.copyWith(status: status));
            },
          ),
          const SizedBox(height: 24),
          if (book.totalPages != null) ...[
            Text('Progress: $_pageValue / ${book.totalPages} pages',
                style: Theme.of(context).textTheme.bodyLarge),
            Slider(
              value: _pageValue.toDouble().clamp(0, maxPages.toDouble()),
              min: 0,
              max: maxPages.toDouble(),
              divisions: maxPages > 0 ? maxPages : null,
              label: '$_pageValue',
              onChanged: (v) => setState(() => _pageValue = v.round()),
              onChangeEnd: (v) => ref.read(booksProvider.notifier).logProgress(book, v.round()),
            ),
          ] else
            const Text('No page count set — add one to track progress.'),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Rating', style: Theme.of(context).textTheme.bodyLarge),
              Row(
                children: List.generate(5, (i) {
                  final filled = (book.rating ?? 0) > i;
                  return IconButton(
                    icon: Icon(filled ? Icons.star : Icons.star_border),
                    onPressed: () => ref.read(booksProvider.notifier).upsert(
                          book.copyWith(rating: i + 1),
                        ),
                  );
                }),
              ),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Notes & quotes', style: Theme.of(context).textTheme.titleMedium),
              TextButton.icon(
                onPressed: () => _addNote(isPremium),
                icon: const Icon(Icons.add),
                label: const Text('Add'),
              ),
            ],
          ),
          notesAsync.when(
            loading: () => const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (err, _) => Text('$err'),
            data: (notes) {
              if (notes.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Text('No notes yet.'),
                );
              }
              return Column(
                children: notes
                    .map((note) => Card(
                          child: ListTile(
                            title: Text(note.content),
                            subtitle: Text(note.page != null ? 'Page ${note.page}' : ''),
                            trailing: IconButton(
                              icon: const Icon(Icons.close, size: 18),
                              onPressed: () =>
                                  ref.read(notesProvider(book.id).notifier).delete(note.id),
                            ),
                          ),
                        ))
                    .toList(),
              );
            },
          ),
          if (!isPremium)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                '${(notesAsync.valueOrNull ?? []).length}/$kFreeNoteLimit free notes used',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
        ],
      ),
    );
  }

  String _statusLabel(ReadingStatus status) => switch (status) {
        ReadingStatus.wantToRead => 'Want to Read',
        ReadingStatus.reading => 'Reading',
        ReadingStatus.finished => 'Finished',
        ReadingStatus.dnf => 'Did Not Finish',
      };
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
