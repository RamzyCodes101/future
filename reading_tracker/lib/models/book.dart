enum ReadingStatus { wantToRead, reading, finished, dnf }

ReadingStatus readingStatusFromString(String value) {
  return ReadingStatus.values.firstWhere(
    (s) => s.name == value,
    orElse: () => ReadingStatus.wantToRead,
  );
}

class Book {
  final String id;
  final String title;
  final String author;
  final String? coverUrl;
  final String? isbn;
  final int? totalPages;
  final int currentPage;
  final ReadingStatus status;
  final int? rating; // 1-5
  final DateTime addedAt;
  final DateTime? startedAt;
  final DateTime? finishedAt;

  const Book({
    required this.id,
    required this.title,
    required this.author,
    this.coverUrl,
    this.isbn,
    this.totalPages,
    this.currentPage = 0,
    this.status = ReadingStatus.wantToRead,
    this.rating,
    required this.addedAt,
    this.startedAt,
    this.finishedAt,
  });

  double get progress {
    if (totalPages == null || totalPages == 0) return 0;
    return (currentPage / totalPages!).clamp(0, 1).toDouble();
  }

  Book copyWith({
    String? title,
    String? author,
    String? coverUrl,
    String? isbn,
    int? totalPages,
    int? currentPage,
    ReadingStatus? status,
    int? rating,
    DateTime? startedAt,
    DateTime? finishedAt,
    bool clearFinishedAt = false,
  }) {
    return Book(
      id: id,
      title: title ?? this.title,
      author: author ?? this.author,
      coverUrl: coverUrl ?? this.coverUrl,
      isbn: isbn ?? this.isbn,
      totalPages: totalPages ?? this.totalPages,
      currentPage: currentPage ?? this.currentPage,
      status: status ?? this.status,
      rating: rating ?? this.rating,
      addedAt: addedAt,
      startedAt: startedAt ?? this.startedAt,
      finishedAt: clearFinishedAt ? null : (finishedAt ?? this.finishedAt),
    );
  }

  Map<String, Object?> toMap() {
    return {
      'id': id,
      'title': title,
      'author': author,
      'coverUrl': coverUrl,
      'isbn': isbn,
      'totalPages': totalPages,
      'currentPage': currentPage,
      'status': status.name,
      'rating': rating,
      'addedAt': addedAt.toIso8601String(),
      'startedAt': startedAt?.toIso8601String(),
      'finishedAt': finishedAt?.toIso8601String(),
    };
  }

  factory Book.fromMap(Map<String, Object?> map) {
    return Book(
      id: map['id'] as String,
      title: map['title'] as String,
      author: map['author'] as String,
      coverUrl: map['coverUrl'] as String?,
      isbn: map['isbn'] as String?,
      totalPages: map['totalPages'] as int?,
      currentPage: map['currentPage'] as int? ?? 0,
      status: readingStatusFromString(map['status'] as String? ?? 'wantToRead'),
      rating: map['rating'] as int?,
      addedAt: DateTime.parse(map['addedAt'] as String),
      startedAt: map['startedAt'] != null ? DateTime.parse(map['startedAt'] as String) : null,
      finishedAt: map['finishedAt'] != null ? DateTime.parse(map['finishedAt'] as String) : null,
    );
  }
}
