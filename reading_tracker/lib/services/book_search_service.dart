import 'dart:convert';

import 'package:http/http.dart' as http;

class BookSearchResult {
  final String title;
  final String author;
  final String? coverUrl;
  final String? isbn;
  final int? pageCount;

  const BookSearchResult({
    required this.title,
    required this.author,
    this.coverUrl,
    this.isbn,
    this.pageCount,
  });
}

/// Looks up books via the public Google Books volumes API.
/// No API key required for basic search volume.
class BookSearchService {
  static const _baseUrl = 'https://www.googleapis.com/books/v1/volumes';

  Future<List<BookSearchResult>> search(String query) async {
    if (query.trim().isEmpty) return [];
    final uri = Uri.parse('$_baseUrl?q=${Uri.encodeQueryComponent(query)}&maxResults=20');
    final response = await http.get(uri);
    if (response.statusCode != 200) return [];

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final items = (data['items'] as List<dynamic>?) ?? [];

    return items.map((item) {
      final volumeInfo = (item as Map<String, dynamic>)['volumeInfo'] as Map<String, dynamic>? ?? {};
      final authors = (volumeInfo['authors'] as List<dynamic>?)?.cast<String>() ?? const ['Unknown author'];
      final imageLinks = volumeInfo['imageLinks'] as Map<String, dynamic>?;
      final identifiers = (volumeInfo['industryIdentifiers'] as List<dynamic>?) ?? [];
      final isbn13 = identifiers.cast<Map<String, dynamic>>().firstWhere(
            (id) => id['type'] == 'ISBN_13',
            orElse: () => const {},
          )['identifier'] as String?;

      return BookSearchResult(
        title: volumeInfo['title'] as String? ?? 'Untitled',
        author: authors.join(', '),
        coverUrl: imageLinks?['thumbnail'] as String?,
        isbn: isbn13,
        pageCount: volumeInfo['pageCount'] as int?,
      );
    }).toList();
  }
}
