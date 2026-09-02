import 'package:shared_preferences/shared_preferences.dart';

/// Stores the user's annual reading goal (number of books) locally.
class GoalService {
  GoalService._();
  static final GoalService instance = GoalService._();

  String _keyForYear(int year) => 'reading_goal_$year';

  Future<int> getGoal(int year) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keyForYear(year)) ?? 12;
  }

  Future<void> setGoal(int year, int goal) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_keyForYear(year), goal);
  }
}
