class BookNote {
  final String id;
  final String bookId;
  final String content;
  final int? page;
  final DateTime createdAt;

  const BookNote({
    required this.id,
    required this.bookId,
    required this.content,
    this.page,
    required this.createdAt,
  });

  Map<String, Object?> toMap() {
    return {
      'id': id,
      'bookId': bookId,
      'content': content,
      'page': page,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory BookNote.fromMap(Map<String, Object?> map) {
    return BookNote(
      id: map['id'] as String,
      bookId: map['bookId'] as String,
      content: map['content'] as String,
      page: map['page'] as int?,
      createdAt: DateTime.parse(map['createdAt'] as String),
    );
  }
}
