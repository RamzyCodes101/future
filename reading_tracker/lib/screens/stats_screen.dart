import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/book.dart';
import '../models/reading_session.dart';
import '../providers/app_providers.dart';
import '../services/goal_service.dart';
import 'paywall_screen.dart';

class StatsScreen extends ConsumerStatefulWidget {
  const StatsScreen({super.key});

  @override
  ConsumerState<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends ConsumerState<StatsScreen> {
  int _goal = 12;
  bool _goalLoaded = false;

  final _year = DateTime.now().year;

  @override
  void initState() {
    super.initState();
    GoalService.instance.getGoal(_year).then((g) {
      if (!mounted) return;
      setState(() {
        _goal = g;
        _goalLoaded = true;
      });
    });
  }

  Future<void> _editGoal() async {
    final controller = TextEditingController(text: '$_goal');
    final value = await showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Annual reading goal'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Books to read this year'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(context, int.tryParse(controller.text) ?? _goal),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (value == null) return;
    setState(() => _goal = value);
    await GoalService.instance.setGoal(_year, value);
  }

  @override
  Widget build(BuildContext context) {
    final booksAsync = ref.watch(booksProvider);
    final sessionsAsync = ref.watch(sessionsProvider);
    final isPremium = ref.watch(isPremiumProvider).valueOrNull ?? false;

    return Scaffold(
      appBar: AppBar(title: const Text('Stats')),
      body: booksAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('$err')),
        data: (books) {
          final finishedThisYear = books
              .where((b) => b.status == ReadingStatus.finished && b.finishedAt?.year == _year)
              .toList();
          final totalPagesThisYear = finishedThisYear.fold<int>(
            0,
            (sum, b) => sum + (b.totalPages ?? 0),
          );

          final sessions = sessionsAsync.valueOrNull ?? [];
          final streak = _computeStreak(sessions.map((s) => s.date).toList());

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (_goalLoaded) _GoalCard(goal: _goal, done: finishedThisYear.length, onEdit: _editGoal),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(label: 'Books finished ($_year)', value: '${finishedThisYear.length}'),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(label: 'Pages read ($_year)', value: '$totalPagesThisYear'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _StatCard(label: 'Current streak', value: '$streak day${streak == 1 ? '' : 's'}'),
              const SizedBox(height: 24),
              if (isPremium)
                _PacePanel(sessions: sessions)
              else
                _PremiumTeaser(
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const PaywallScreen()),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  int _computeStreak(List<DateTime> dates) {
    if (dates.isEmpty) return 0;
    final days = dates.map((d) => DateTime(d.year, d.month, d.day)).toSet();
    var streak = 0;
    var cursor = DateTime.now();
    cursor = DateTime(cursor.year, cursor.month, cursor.day);
    while (days.contains(cursor)) {
      streak++;
      cursor = cursor.subtract(const Duration(days: 1));
    }
    return streak;
  }
}

class _GoalCard extends StatelessWidget {
  final int goal;
  final int done;
  final VoidCallback onEdit;
  const _GoalCard({required this.goal, required this.done, required this.onEdit});

  @override
  Widget build(BuildContext context) {
    final progress = goal == 0 ? 0.0 : (done / goal).clamp(0, 1).toDouble();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Reading goal', style: Theme.of(context).textTheme.titleMedium),
                TextButton(onPressed: onEdit, child: const Text('Edit')),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(value: progress, minHeight: 10),
            ),
            const SizedBox(height: 8),
            Text('$done of $goal books this year'),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  const _StatCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 4),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _PacePanel extends StatelessWidget {
  final List<ReadingSession> sessions;
  const _PacePanel({required this.sessions});

  @override
  Widget build(BuildContext context) {
    final last30 = sessions.where((s) => DateTime.now().difference(s.date).inDays <= 30).toList();
    final pagesLast30 = last30.fold<int>(0, (sum, s) => sum + s.pagesRead);
    final avgPerDay = pagesLast30 / 30;

    return Card(
      color: Theme.of(context).colorScheme.secondaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.workspace_premium, size: 18),
                const SizedBox(width: 8),
                Text('Your pace', style: Theme.of(context).textTheme.titleMedium),
              ],
            ),
            const SizedBox(height: 8),
            Text('${avgPerDay.toStringAsFixed(1)} pages/day average over the last 30 days'),
            Text('$pagesLast30 pages read in the last 30 days'),
          ],
        ),
      ),
    );
  }
}

class _PremiumTeaser extends StatelessWidget {
  final VoidCallback onTap;
  const _PremiumTeaser({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.workspace_premium_outlined),
        title: const Text('Unlock pace & trend insights'),
        subtitle: const Text('See your daily pace, projections, and monthly breakdowns with Premium.'),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
