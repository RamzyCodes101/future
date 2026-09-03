import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../models/book.dart';
import '../models/note.dart';
import '../providers/app_providers.dart';
import '../theme/app_theme.dart';
import '../widgets/book_cover_art.dart';
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
    final accent = AppColors.coverColorFor(book.id);
    final noteCount = notesAsync.valueOrNull?.length ?? 0;

    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        backgroundColor: AppColors.cream,
        title: const Text(''),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded),
            onPressed: _deleteBook,
            color: AppColors.inkMuted,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: accent.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                BookCoverArt(book: book, width: 72, height: 104, radius: 14),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        book.title,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, height: 1.15),
                      ),
                      const SizedBox(height: 4),
                      Text(book.author, style: const TextStyle(color: AppColors.inkMuted, fontSize: 14)),
                      const SizedBox(height: 12),
                      Row(
                        children: List.generate(5, (i) {
                          final filled = (book.rating ?? 0) > i;
                          return GestureDetector(
                            onTap: () => ref
                                .read(booksProvider.notifier)
                                .upsert(book.copyWith(rating: i + 1)),
                            child: Padding(
                              padding: const EdgeInsets.only(right: 2),
                              child: Icon(
                                filled ? Icons.star_rounded : Icons.star_border_rounded,
                                color: AppColors.yellowDeeper,
                                size: 26,
                              ),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('Status', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ReadingStatus.values.map((status) {
              final selected = status == book.status;
              final color = AppColors.statusColor(status);
              return GestureDetector(
                onTap: () => ref.read(booksProvider.notifier).upsert(book.copyWith(status: status)),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                  decoration: BoxDecoration(
                    color: selected ? color : color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _statusLabel(status),
                    style: TextStyle(
                      color: selected ? Colors.white : color,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          if (book.totalPages != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Progress', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                Text(
                  '$_pageValue / ${book.totalPages} pages',
                  style: const TextStyle(color: AppColors.inkMuted, fontWeight: FontWeight.w600),
                ),
              ],
            ),
            SliderTheme(
              data: SliderTheme.of(context).copyWith(
                activeTrackColor: accent,
                thumbColor: accent,
                overlayColor: accent.withValues(alpha: 0.15),
                inactiveTrackColor: AppColors.hairline,
              ),
              child: Slider(
                value: _pageValue.toDouble().clamp(0, maxPages.toDouble()),
                min: 0,
                max: maxPages.toDouble(),
                divisions: maxPages > 0 ? maxPages : null,
                label: '$_pageValue',
                onChanged: (v) => setState(() => _pageValue = v.round()),
                onChangeEnd: (v) => ref.read(booksProvider.notifier).logProgress(book, v.round()),
              ),
            ),
          ] else
            const Text('No page count set — add one to track progress.', style: TextStyle(color: AppColors.inkMuted)),
          const SizedBox(height: 8),
          const Divider(),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Notes & quotes', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              TextButton.icon(
                onPressed: () => _addNote(isPremium),
                icon: const Icon(Icons.add_rounded, size: 18),
                label: const Text('Add'),
              ),
            ],
          ),
          if (!isPremium) ...[
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: LinearProgressIndicator(
                value: (noteCount / kFreeNoteLimit).clamp(0, 1).toDouble(),
                minHeight: 5,
                backgroundColor: AppColors.hairline,
                valueColor: const AlwaysStoppedAnimation(AppColors.yellowDeeper),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$noteCount/$kFreeNoteLimit free notes used',
              style: const TextStyle(color: AppColors.inkMuted, fontSize: 11.5),
            ),
          ],
          const SizedBox(height: 8),
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
                  child: Text('No notes yet.', style: TextStyle(color: AppColors.inkMuted)),
                );
              }
              return Column(
                children: notes
                    .map((note) => Container(
                          margin: const EdgeInsets.only(top: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.yellowPale.withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(16),
                            border: const Border(left: BorderSide(color: AppColors.yellowDeeper, width: 4)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(note.content, style: const TextStyle(fontSize: 14, height: 1.35)),
                                    if (note.page != null) ...[
                                      const SizedBox(height: 6),
                                      Text(
                                        'Page ${note.page}',
                                        style: const TextStyle(
                                          color: AppColors.inkMuted,
                                          fontSize: 11.5,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              GestureDetector(
                                onTap: () => ref.read(notesProvider(book.id).notifier).delete(note.id),
                                child: const Icon(Icons.close_rounded, size: 18, color: AppColors.inkMuted),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              );
            },
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
