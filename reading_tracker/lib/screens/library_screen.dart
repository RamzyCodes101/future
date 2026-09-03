import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/book.dart';
import '../providers/app_providers.dart';
import '../theme/app_theme.dart';
import '../widgets/book_tile.dart';
import 'add_book_screen.dart';
import 'book_detail_screen.dart';
import 'paywall_screen.dart';
import 'stats_screen.dart';

class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  static const _tabs = [
    ('Reading', ReadingStatus.reading),
    ('Want to Read', ReadingStatus.wantToRead),
    ('Finished', ReadingStatus.finished),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
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
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
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
                const SizedBox(height: 18),
                _PillTabBar(controller: _tabController, tabs: _tabs.map((t) => t.$1).toList()),
              ],
            ),
          ),
          Expanded(
            child: booksAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Something went wrong: $err')),
              data: (books) {
                return TabBarView(
                  controller: _tabController,
                  children: _tabs.map((t) {
                    final filtered = books.where((b) => b.status == t.$2).toList();
                    if (filtered.isEmpty) {
                      return _EmptyState(status: t.$2);
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
                  }).toList(),
                );
              },
            ),
          ),
        ],
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

class _PillTabBar extends StatelessWidget {
  final TabController controller;
  final List<String> tabs;
  const _PillTabBar({required this.controller, required this.tabs});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.creamCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.hairline),
      ),
      child: TabBar(
        controller: controller,
        tabs: tabs.map((t) => Tab(text: t)).toList(),
        dividerColor: Colors.transparent,
        indicatorSize: TabBarIndicatorSize.tab,
        indicator: BoxDecoration(
          color: AppColors.yellowDeep,
          borderRadius: BorderRadius.circular(12),
        ),
        labelColor: AppColors.ink,
        unselectedLabelColor: AppColors.inkMuted,
        labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
        splashBorderRadius: BorderRadius.circular(12),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final ReadingStatus status;
  const _EmptyState({required this.status});

  @override
  Widget build(BuildContext context) {
    final (message, emoji) = switch (status) {
      ReadingStatus.reading => ("You're not reading anything yet.\nAdd a book to get started.", '📖'),
      ReadingStatus.wantToRead => ('Nothing on your want-to-read shelf yet.', '📝'),
      ReadingStatus.finished => ('No finished books yet — keep going!', '🎉'),
      ReadingStatus.dnf => ('Nothing here.', '📚'),
    };
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 40)),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.inkMuted, fontSize: 15),
            ),
          ],
        ),
      ),
    );
  }
}
