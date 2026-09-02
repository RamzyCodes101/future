class ReadingSession {
  final String id;
  final String bookId;
  final DateTime date;
  final int pagesRead;

  const ReadingSession({
    required this.id,
    required this.bookId,
    required this.date,
    required this.pagesRead,
  });

  Map<String, Object?> toMap() {
    return {
      'id': id,
      'bookId': bookId,
      'date': date.toIso8601String(),
      'pagesRead': pagesRead,
    };
  }

  factory ReadingSession.fromMap(Map<String, Object?> map) {
    return ReadingSession(
      id: map['id'] as String,
      bookId: map['bookId'] as String,
      date: DateTime.parse(map['date'] as String),
      pagesRead: map['pagesRead'] as int,
    );
  }
}
