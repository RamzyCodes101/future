import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/book.dart';
import '../providers/app_providers.dart';
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

  @override
  Widget build(BuildContext context) {
    final booksAsync = ref.watch(booksProvider);
    final isPremiumAsync = ref.watch(isPremiumProvider);
    final isPremium = isPremiumAsync.valueOrNull ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pages'),
        actions: [
          if (!isPremium)
            IconButton(
              icon: const Icon(Icons.workspace_premium_outlined),
              tooltip: 'Go Premium',
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PaywallScreen()),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.bar_chart),
            tooltip: 'Stats',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const StatsScreen()),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: _tabs.map((t) => Tab(text: t.$1)).toList(),
        ),
      ),
      body: booksAsync.when(
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const AddBookScreen()),
        ),
        icon: const Icon(Icons.add),
        label: const Text('Add book'),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final ReadingStatus status;
  const _EmptyState({required this.status});

  @override
  Widget build(BuildContext context) {
    final message = switch (status) {
      ReadingStatus.reading => "You're not reading anything yet.\nAdd a book to get started.",
      ReadingStatus.wantToRead => 'Nothing on your want-to-read shelf yet.',
      ReadingStatus.finished => 'No finished books yet — keep going!',
      ReadingStatus.dnf => 'Nothing here.',
    };
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Text(
          message,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
      ),
    );
  }
}
