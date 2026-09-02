import 'package:sqflite/sqflite.dart';

import '../models/book.dart';
import '../models/note.dart';
import '../models/reading_session.dart';
import 'app_database.dart';

class BookRepository {
  BookRepository._();
  static final BookRepository instance = BookRepository._();

  Future<List<Book>> getAllBooks() async {
    final db = await AppDatabase.instance.database;
    final rows = await db.query('books', orderBy: 'addedAt DESC');
    return rows.map(Book.fromMap).toList();
  }

  Future<void> upsertBook(Book book) async {
    final db = await AppDatabase.instance.database;
    await db.insert(
      'books',
      book.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> deleteBook(String id) async {
    final db = await AppDatabase.instance.database;
    await db.delete('books', where: 'id = ?', whereArgs: [id]);
    await db.delete('notes', where: 'bookId = ?', whereArgs: [id]);
    await db.delete('sessions', where: 'bookId = ?', whereArgs: [id]);
  }

  Future<List<BookNote>> getNotesForBook(String bookId) async {
    final db = await AppDatabase.instance.database;
    final rows = await db.query(
      'notes',
      where: 'bookId = ?',
      whereArgs: [bookId],
      orderBy: 'createdAt DESC',
    );
    return rows.map(BookNote.fromMap).toList();
  }

  Future<void> addNote(BookNote note) async {
    final db = await AppDatabase.instance.database;
    await db.insert('notes', note.toMap());
  }

  Future<void> deleteNote(String id) async {
    final db = await AppDatabase.instance.database;
    await db.delete('notes', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> addSession(ReadingSession session) async {
    final db = await AppDatabase.instance.database;
    await db.insert('sessions', session.toMap());
  }

  Future<List<ReadingSession>> getAllSessions() async {
    final db = await AppDatabase.instance.database;
    final rows = await db.query('sessions', orderBy: 'date DESC');
    return rows.map(ReadingSession.fromMap).toList();
  }
}
