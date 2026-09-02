import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/book_repository.dart';
import '../models/book.dart';
import '../models/note.dart';
import '../models/reading_session.dart';
import '../services/premium_service.dart';

final bookRepositoryProvider = Provider<BookRepository>((ref) {
  return BookRepository.instance;
});

class BooksNotifier extends AsyncNotifier<List<Book>> {
  @override
  Future<List<Book>> build() {
    return ref.read(bookRepositoryProvider).getAllBooks();
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => ref.read(bookRepositoryProvider).getAllBooks());
  }

  Future<void> upsert(Book book) async {
    await ref.read(bookRepositoryProvider).upsertBook(book);
    await refresh();
  }

  Future<void> delete(String id) async {
    await ref.read(bookRepositoryProvider).deleteBook(id);
    await refresh();
  }

  Future<void> logProgress(Book book, int newCurrentPage) async {
    final pagesRead = (newCurrentPage - book.currentPage).clamp(0, 1 << 30);
    final updated = book.copyWith(
      currentPage: newCurrentPage,
      status: book.totalPages != null && newCurrentPage >= book.totalPages!
          ? ReadingStatus.finished
          : ReadingStatus.reading,
      startedAt: book.startedAt ?? DateTime.now(),
      finishedAt: book.totalPages != null && newCurrentPage >= book.totalPages!
          ? DateTime.now()
          : book.finishedAt,
    );
    await ref.read(bookRepositoryProvider).upsertBook(updated);
    if (pagesRead > 0) {
      await ref.read(bookRepositoryProvider).addSession(
            ReadingSession(
              id: DateTime.now().microsecondsSinceEpoch.toString(),
              bookId: book.id,
              date: DateTime.now(),
              pagesRead: pagesRead,
            ),
          );
    }
    await refresh();
  }
}

final booksProvider = AsyncNotifierProvider<BooksNotifier, List<Book>>(BooksNotifier.new);

final sessionsProvider = FutureProvider<List<ReadingSession>>((ref) {
  return ref.read(bookRepositoryProvider).getAllSessions();
});

final premiumServiceProvider = Provider<PremiumService>((ref) => PremiumService.instance);

final isPremiumProvider = StreamProvider<bool>((ref) {
  return ref.read(premiumServiceProvider).premiumStream;
});

class NotesNotifier extends FamilyAsyncNotifier<List<BookNote>, String> {
  @override
  Future<List<BookNote>> build(String bookId) {
    return ref.read(bookRepositoryProvider).getNotesForBook(bookId);
  }

  Future<void> add(BookNote note) async {
    await ref.read(bookRepositoryProvider).addNote(note);
    state = await AsyncValue.guard(() => ref.read(bookRepositoryProvider).getNotesForBook(arg));
  }

  Future<void> delete(String id) async {
    await ref.read(bookRepositoryProvider).deleteNote(id);
    state = await AsyncValue.guard(() => ref.read(bookRepositoryProvider).getNotesForBook(arg));
  }
}

final notesProvider = AsyncNotifierProvider.family<NotesNotifier, List<BookNote>, String>(
  NotesNotifier.new,
);
