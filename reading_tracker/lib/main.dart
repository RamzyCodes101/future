import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'screens/library_screen.dart';
import 'services/premium_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await PremiumService.instance.init();
  runApp(const ProviderScope(child: ReadingTrackerApp()));
}

class ReadingTrackerApp extends StatelessWidget {
  const ReadingTrackerApp({super.key});

  @override
  Widget build(BuildContext context) {
    final seedColor = const Color(0xFF3B6E5A);
    return MaterialApp(
      title: 'Pages',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: seedColor),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: seedColor,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const LibraryScreen(),
    );
  }
}
