import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:reading_tracker/main.dart';

void main() {
  testWidgets('App launches and shows the home screen chrome', (WidgetTester tester) async {
    // sqflite has no platform channel under `flutter test`, so the books
    // query fails and the shelves never render here — that's expected and
    // covered on a real device. This just checks the screen boots.
    await tester.pumpWidget(const ProviderScope(child: ReadingTrackerApp()));
    await tester.pumpAndSettle();

    expect(find.text('Pages'), findsOneWidget);
    expect(find.text('Add book'), findsOneWidget);
  });
}
