import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class AppDatabase {
  AppDatabase._();
  static final AppDatabase instance = AppDatabase._();

  Database? _db;

  Future<Database> get database async {
    _db ??= await _open();
    return _db!;
  }

  Future<Database> _open() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'reading_tracker.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE books (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            coverUrl TEXT,
            isbn TEXT,
            totalPages INTEGER,
            currentPage INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL,
            rating INTEGER,
            addedAt TEXT NOT NULL,
            startedAt TEXT,
            finishedAt TEXT
          )
        ''');
        await db.execute('''
          CREATE TABLE notes (
            id TEXT PRIMARY KEY,
            bookId TEXT NOT NULL,
            content TEXT NOT NULL,
            page INTEGER,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (bookId) REFERENCES books (id) ON DELETE CASCADE
          )
        ''');
        await db.execute('''
          CREATE TABLE sessions (
            id TEXT PRIMARY KEY,
            bookId TEXT NOT NULL,
            date TEXT NOT NULL,
            pagesRead INTEGER NOT NULL,
            FOREIGN KEY (bookId) REFERENCES books (id) ON DELETE CASCADE
          )
        ''');
      },
    );
  }
}
