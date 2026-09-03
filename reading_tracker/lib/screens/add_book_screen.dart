import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../models/book.dart';
import '../providers/app_providers.dart';
import '../services/book_search_service.dart';
import '../theme/app_theme.dart';

class AddBookScreen extends ConsumerStatefulWidget {
  const AddBookScreen({super.key});

  @override
  ConsumerState<AddBookScreen> createState() => _AddBookScreenState();
}

class _AddBookScreenState extends ConsumerState<AddBookScreen> {
  final _searchController = TextEditingController();
  final _searchService = BookSearchService();
  List<BookSearchResult> _results = [];
  bool _loading = false;
  String? _error;

  Future<void> _search(String query) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await _searchService.search(query);
      if (!mounted) return;
      setState(() => _results = results);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = "Couldn't reach the book search service.");
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addBook(BookSearchResult result, {ReadingStatus status = ReadingStatus.wantToRead}) async {
    final book = Book(
      id: const Uuid().v4(),
      title: result.title,
      author: result.author,
      coverUrl: result.coverUrl,
      isbn: result.isbn,
      totalPages: result.pageCount,
      status: status,
      addedAt: DateTime.now(),
    );
    await ref.read(booksProvider.notifier).upsert(book);
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  Future<void> _openManualEntry() async {
    final book = await showModalBottomSheet<Book>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _ManualEntrySheet(),
    );
    if (book == null) return;
    await ref.read(booksProvider.notifier).upsert(book);
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add a book'),
        actions: [
          TextButton(
            onPressed: _openManualEntry,
            child: const Text('Enter manually'),
          ),
        ],
      ),
      backgroundColor: AppColors.cream,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.creamCard,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: AppColors.hairline),
              ),
              child: TextField(
                controller: _searchController,
                decoration: const InputDecoration(
                  hintText: 'Search by title or author',
                  hintStyle: TextStyle(color: AppColors.inkMuted),
                  prefixIcon: Icon(Icons.search_rounded, color: AppColors.inkMuted),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 14),
                ),
                onSubmitted: _search,
              ),
            ),
          ),
          if (_loading) const LinearProgressIndicator(),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(_error!, style: const TextStyle(color: AppColors.coral)),
            ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: _results.length,
              itemBuilder: (context, index) {
                final result = _results[index];
                return _SearchResultTile(result: result, onAdd: () => _addBook(result));
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  final BookSearchResult result;
  final VoidCallback onAdd;
  const _SearchResultTile({required this.result, required this.onAdd});

  @override
  Widget build(BuildContext context) {
    final accent = AppColors.coverColorFor(result.title);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Material(
        color: AppColors.creamCard,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onAdd,
          borderRadius: BorderRadius.circular(18),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.hairline),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: result.coverUrl != null
                      ? Image.network(
                          result.coverUrl!,
                          width: 42,
                          height: 60,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => _placeholder(accent),
                        )
                      : _placeholder(accent),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        result.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        result.author,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: AppColors.inkMuted, fontSize: 12.5),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle_rounded),
                  color: AppColors.yellowDeeper,
                  onPressed: onAdd,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _placeholder(Color accent) {
    return Container(
      width: 42,
      height: 60,
      color: accent.withValues(alpha: 0.18),
      child: Icon(Icons.menu_book_rounded, size: 18, color: accent),
    );
  }
}

class _ManualEntrySheet extends StatefulWidget {
  const _ManualEntrySheet();

  @override
  State<_ManualEntrySheet> createState() => _ManualEntrySheetState();
}

class _ManualEntrySheetState extends State<_ManualEntrySheet> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _authorController = TextEditingController();
  final _pagesController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _authorController.dispose();
    _pagesController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final book = Book(
      id: const Uuid().v4(),
      title: _titleController.text.trim(),
      author: _authorController.text.trim(),
      totalPages: int.tryParse(_pagesController.text.trim()),
      addedAt: DateTime.now(),
    );
    Navigator.of(context).pop(book);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Add manually', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Title'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            TextFormField(
              controller: _authorController,
              decoration: const InputDecoration(labelText: 'Author'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            TextFormField(
              controller: _pagesController,
              decoration: const InputDecoration(labelText: 'Total pages (optional)'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(onPressed: _submit, child: const Text('Add to library')),
            ),
          ],
        ),
      ),
    );
  }
}
