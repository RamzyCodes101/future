import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/book.dart';
import '../providers/app_providers.dart';
import '../theme/app_theme.dart';
import '../widgets/cover_card.dart';
import 'add_book_screen.dart';
import 'book_detail_screen.dart';
import 'paywall_screen.dart';
import 'shelf_list_screen.dart';
import 'stats_screen.dart';

class LibraryScreen extends ConsumerWidget {
  const LibraryScreen({super.key});

  static const _shelves = [
    ('Reading', ReadingStatus.reading),
    ('Want to Read', ReadingStatus.wantToRead),
    ('Finished', ReadingStatus.finished),
  ];

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booksAsync = ref.watch(booksProvider);
    final isPremiumAsync = ref.watch(isPremiumProvider);
    final isPremium = isPremiumAsync.valueOrNull ?? false;
    final readingCount = booksAsync.valueOrNull?.where((b) => b.status == ReadingStatus.reading).length ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pages'),
        actions: [
          if (!isPremium)
            _AppBarIconButton(
              icon: Icons.workspace_premium_rounded,
              color: AppColors.yellowDeeper,
              tooltip: 'Go Premium',
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PaywallScreen()),
              ),
            ),
          _AppBarIconButton(
            icon: Icons.bar_chart_rounded,
            color: AppColors.coral,
            tooltip: 'Stats',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const StatsScreen()),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: booksAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Something went wrong: $err')),
        data: (books) {
          return ListView(
            padding: const EdgeInsets.only(bottom: 100),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _greeting(),
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      readingCount == 0
                          ? 'Ready to start something new?'
                          : "You're reading $readingCount book${readingCount == 1 ? '' : 's'} right now",
                      style: const TextStyle(color: AppColors.inkMuted, fontSize: 14.5),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              if (!isPremium)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _PremiumBanner(
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const PaywallScreen()),
                    ),
                  ),
                ),
              if (!isPremium) const SizedBox(height: 26),
              for (final shelf in _shelves) ...[
                _ShelfSection(
                  title: shelf.$1,
                  status: shelf.$2,
                  books: books.where((b) => b.status == shelf.$2).toList(),
                ),
                const SizedBox(height: 26),
              ],
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const AddBookScreen()),
        ),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add book'),
      ),
    );
  }
}

class _PremiumBanner extends StatelessWidget {
  final VoidCallback onTap;
  const _PremiumBanner({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.yellowPale.withValues(alpha: 0.6),
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Unlock Premium',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: AppColors.ink),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Unlimited notes, pace insights\n& reading trends',
                      style: TextStyle(color: AppColors.inkMuted, fontSize: 13, height: 1.3),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.ink,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Upgrade now',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12.5),
                          ),
                          SizedBox(width: 4),
                          Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 14),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(color: AppColors.yellowDeep, shape: BoxShape.circle),
                child: const Icon(Icons.auto_awesome_rounded, color: AppColors.ink, size: 30),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShelfSection extends StatelessWidget {
  final String title;
  final ReadingStatus status;
  final List<Book> books;

  const _ShelfSection({required this.title, required this.status, required this.books});

  @override
  Widget build(BuildContext context) {
    // Hide empty non-primary shelves so the home screen stays tidy; the
    // "Reading" shelf always shows so there's a clear place to start.
    if (books.isEmpty && status != ReadingStatus.reading) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
                  if (books.isNotEmpty) ...[
                    const SizedBox(width: 8),
                    Text(
                      '${books.length} book${books.length == 1 ? '' : 's'}',
                      style: const TextStyle(color: AppColors.inkMuted, fontSize: 12.5),
                    ),
                  ],
                ],
              ),
              if (books.isNotEmpty)
                GestureDetector(
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => ShelfListScreen(status: status, title: title)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'See all',
                        style: TextStyle(color: AppColors.coral, fontWeight: FontWeight.w700, fontSize: 13),
                      ),
                      Icon(Icons.chevron_right_rounded, color: AppColors.coral, size: 18),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (books.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              "You're not reading anything yet — add a book to get started.",
              style: const TextStyle(color: AppColors.inkMuted, fontSize: 13.5),
            ),
          )
        else
          SizedBox(
            height: 236,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: books.length,
              separatorBuilder: (context, index) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final book = books[index];
                return CoverCard(
                  book: book,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => BookDetailScreen(bookId: book.id)),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}

class _AppBarIconButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;
  final VoidCallback onPressed;

  const _AppBarIconButton({
    required this.icon,
    required this.color,
    required this.tooltip,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: IconButton(
        tooltip: tooltip,
        onPressed: onPressed,
        style: IconButton.styleFrom(
          backgroundColor: color.withValues(alpha: 0.14),
          foregroundColor: color,
          shape: const CircleBorder(),
        ),
        icon: Icon(icon),
      ),
    );
  }
}
