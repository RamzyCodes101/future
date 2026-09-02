import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../models/book.dart';
import '../providers/app_providers.dart';
import '../services/book_search_service.dart';

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
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search by title or author',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onSubmitted: _search,
            ),
          ),
          if (_loading) const LinearProgressIndicator(),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          Expanded(
            child: ListView.builder(
              itemCount: _results.length,
              itemBuilder: (context, index) {
                final result = _results[index];
                return ListTile(
                  leading: result.coverUrl != null
                      ? Image.network(result.coverUrl!, width: 40, fit: BoxFit.cover)
                      : const Icon(Icons.menu_book),
                  title: Text(result.title, maxLines: 2, overflow: TextOverflow.ellipsis),
                  subtitle: Text(result.author),
                  trailing: IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: () => _addBook(result),
                  ),
                  onTap: () => _addBook(result),
                );
              },
            ),
          ),
        ],
      ),
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
