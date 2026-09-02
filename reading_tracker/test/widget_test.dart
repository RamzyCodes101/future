import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:reading_tracker/main.dart';

void main() {
  testWidgets('App launches and shows the library shelves', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ReadingTrackerApp()));
    await tester.pumpAndSettle();

    expect(find.text('Pages'), findsOneWidget);
    expect(find.text('Reading'), findsOneWidget);
    expect(find.text('Want to Read'), findsOneWidget);
    expect(find.text('Finished'), findsOneWidget);
    expect(find.text('Add book'), findsOneWidget);
  });
}
