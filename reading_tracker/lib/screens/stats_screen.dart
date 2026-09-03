import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/book.dart';
import '../models/reading_session.dart';
import '../providers/app_providers.dart';
import '../services/goal_service.dart';
import '../theme/app_theme.dart';
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
            padding: const EdgeInsets.all(20),
            children: [
              if (_goalLoaded) _GoalRingCard(goal: _goal, done: finishedThisYear.length, onEdit: _editGoal),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      label: 'Books finished',
                      sublabel: '$_year',
                      value: '${finishedThisYear.length}',
                      emoji: '📚',
                      tint: AppColors.sage,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'Pages read',
                      sublabel: '$_year',
                      value: '$totalPagesThisYear',
                      emoji: '📄',
                      tint: AppColors.periwinkle,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _StatCard(
                label: 'Current streak',
                sublabel: 'consecutive days',
                value: '$streak',
                emoji: '🔥',
                tint: AppColors.coral,
                wide: true,
              ),
              const SizedBox(height: 20),
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

class _GoalRingCard extends StatelessWidget {
  final int goal;
  final int done;
  final VoidCallback onEdit;
  const _GoalRingCard({required this.goal, required this.done, required this.onEdit});

  @override
  Widget build(BuildContext context) {
    final progress = goal == 0 ? 0.0 : (done / goal).clamp(0, 1).toDouble();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.yellowPale.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 84,
            height: 84,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 84,
                  height: 84,
                  child: CircularProgressIndicator(
                    value: progress,
                    strokeWidth: 9,
                    strokeCap: StrokeCap.round,
                    backgroundColor: AppColors.creamCard,
                    valueColor: const AlwaysStoppedAnimation(AppColors.yellowDeeper),
                  ),
                ),
                Text(
                  '${(progress * 100).round()}%',
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.ink),
                ),
              ],
            ),
          ),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Reading goal', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
                    GestureDetector(
                      onTap: onEdit,
                      child: const Text(
                        'Edit',
                        style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.coral),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  '$done of $goal books this year',
                  style: const TextStyle(color: AppColors.inkMuted, fontSize: 13.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String sublabel;
  final String value;
  final String emoji;
  final Color tint;
  final bool wide;

  const _StatCard({
    required this.label,
    required this.sublabel,
    required this.value,
    required this.emoji,
    required this.tint,
    this.wide = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: tint.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(20),
      ),
      child: wide
          ? Row(
              children: [
                Text(emoji, style: const TextStyle(fontSize: 28)),
                const SizedBox(width: 14),
                Text(value, style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: tint)),
                const SizedBox(width: 8),
                Text('days', style: TextStyle(fontSize: 14, color: tint, fontWeight: FontWeight.w700)),
                const Spacer(),
                Text(label, style: const TextStyle(color: AppColors.inkMuted, fontSize: 12.5)),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(emoji, style: const TextStyle(fontSize: 24)),
                const SizedBox(height: 10),
                Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: tint)),
                const SizedBox(height: 2),
                Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                Text(sublabel, style: const TextStyle(color: AppColors.inkMuted, fontSize: 11.5)),
              ],
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

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.sage.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.workspace_premium_rounded, size: 18, color: AppColors.sage),
              const SizedBox(width: 8),
              const Text('Your pace', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 10),
          Text('${avgPerDay.toStringAsFixed(1)} pages/day average over the last 30 days'),
          const SizedBox(height: 2),
          Text('$pagesLast30 pages read in the last 30 days', style: const TextStyle(color: AppColors.inkMuted)),
        ],
      ),
    );
  }
}

class _PremiumTeaser extends StatelessWidget {
  final VoidCallback onTap;
  const _PremiumTeaser({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.yellowPale.withValues(alpha: 0.55),
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(color: AppColors.yellowDeep, shape: BoxShape.circle),
                child: const Icon(Icons.workspace_premium_rounded, color: AppColors.ink),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Unlock pace & trend insights', style: TextStyle(fontWeight: FontWeight.w800)),
                    SizedBox(height: 2),
                    Text(
                      'See your daily pace, projections, and monthly breakdowns.',
                      style: TextStyle(color: AppColors.inkMuted, fontSize: 12.5),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.ink),
            ],
          ),
        ),
      ),
    );
  }
}
