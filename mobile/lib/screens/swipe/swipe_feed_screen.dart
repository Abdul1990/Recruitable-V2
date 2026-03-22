import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:go_router/go_router.dart';
import '../../models/job.dart';
import '../../models/match.dart';
import '../../models/user_profile.dart';
import '../../services/auth_service.dart';
import '../../services/firestore_service.dart';
import '../../services/matching_service.dart';
import 'job_card.dart';

class SwipeFeedScreen extends StatefulWidget {
  const SwipeFeedScreen({super.key});

  @override
  State<SwipeFeedScreen> createState() => _SwipeFeedScreenState();
}

class _SwipeFeedScreenState extends State<SwipeFeedScreen> {
  final CardSwiperController _swiperController = CardSwiperController();

  UserProfile? _profile;
  List<({Job job, MatchResult result})> _feed = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFeed();
  }

  Future<void> _loadFeed() async {
    setState(() { _loading = true; _error = null; });

    try {
      final uid = AuthService.instance.currentUser?.uid;
      if (uid == null) throw Exception('Not signed in');

      final profile = await FirestoreService.instance.getUser(uid);
      if (profile == null || profile.specialism.isEmpty) {
        if (mounted) context.go('/onboarding/skills');
        return;
      }

      final alreadySwiped = await FirestoreService.instance.getSwipedJobIds(uid);
      // Pass user's region so APAC-local jobs surface first in the feed
      final jobs = profile.location.isNotEmpty
          ? await FirestoreService.instance.getJobsForUser(
              userRegionCode: profile.location,
              specialismCategory: profile.specialism,
            )
          : await FirestoreService.instance.getAllJobs();

      final feed = await MatchingService.instance.buildScoredFeed(
        candidate: profile,
        jobs: jobs,
        alreadySwiped: alreadySwiped,
      );

      if (mounted) {
        setState(() {
          _profile = profile;
          _feed = feed;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _onSwipe(int index, CardSwiperDirection direction) async {
    if (index >= _feed.length) return;
    final item = _feed[index];
    final uid = AuthService.instance.currentUser!.uid;
    final swipeDir = direction == CardSwiperDirection.right
        ? SwipeDirection.right
        : SwipeDirection.left;

    await FirestoreService.instance.recordSwipe(
      uid: uid,
      decision: SwipeDecision(
        jobId: item.job.id,
        direction: swipeDir,
        matchScore: item.result.score,
        matchReason: item.result.reason,
        decidedAt: DateTime.now(),
      ),
    );

    // Right swipe = interested → create a match
    if (swipeDir == SwipeDirection.right) {
      await FirestoreService.instance.createMatch(
        candidateId: uid,
        jobId: item.job.id,
        company: item.job.company,
        jobTitle: item.job.title,
        matchScore: item.result.score,
      );
      if (mounted) _showMatchPopup(item.job, item.result);
    }
  }

  void _showMatchPopup(Job job, MatchResult result) {
    showDialog(
      context: context,
      builder: (_) => _MatchDialog(job: job, result: result),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      appBar: _buildAppBar(),
      body: _loading
          ? const _LoadingFeed()
          : _error != null
              ? _ErrorView(error: _error!, onRetry: _loadFeed)
              : _feed.isEmpty
                  ? const _EmptyFeed()
                  : _buildSwiper(),
    );
  }

  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      titleSpacing: 20,
      title: Row(
        children: [
          Container(
            width: 28, height: 28,
            decoration: const BoxDecoration(
              color: Color(0xFFE91E63),
              borderRadius: BorderRadius.all(Radius.circular(6)),
            ),
            child: const Icon(Icons.extension, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 10),
          const Text(
            'recruitable',
            style: TextStyle(
              fontFamily: 'Nunito', fontWeight: FontWeight.w800,
              color: Color(0xFF212121), fontSize: 18,
            ),
          ),
        ],
      ),
      actions: [
        if (_profile != null)
          GestureDetector(
            onTap: () => context.go('/profile'),
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: CircleAvatar(
                radius: 18,
                backgroundImage: NetworkImage(_profile!.photoURL),
                backgroundColor: const Color(0xFFE91E63),
              ),
            ),
          ),
        IconButton(
          icon: const Icon(Icons.favorite_border, color: Color(0xFF212121)),
          onPressed: () => context.go('/matches'),
        ),
      ],
    );
  }

  Widget _buildSwiper() {
    return CardSwiper(
      controller: _swiperController,
      cardsCount: _feed.length,
      numberOfCardsDisplayed: 3,
      backCardOffset: const Offset(0, 30),
      scale: 0.92,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
      onSwipe: (prev, curr, dir) {
        _onSwipe(prev, dir);
        return true;
      },
      cardBuilder: (context, index, topPercent, bottomPercent) {
        final item = _feed[index];
        return JobCard(job: item.job, matchResult: item.result);
      },
    );
  }

  @override
  void dispose() {
    _swiperController.dispose();
    super.dispose();
  }
}

// ─── Supporting Widgets ───────────────────────────────────────────────────────

class _LoadingFeed extends StatelessWidget {
  const _LoadingFeed();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircularProgressIndicator(color: Color(0xFFE91E63)),
          SizedBox(height: 20),
          Text(
            'Finding your best matches...',
            style: TextStyle(
              fontFamily: 'Nunito',
              fontWeight: FontWeight.w700,
              fontSize: 15,
              color: Color(0xFF8A8A9E),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyFeed extends StatelessWidget {
  const _EmptyFeed();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle_outline, size: 64, color: Color(0xFF00BCD4)),
          const SizedBox(height: 16),
          const Text(
            "You're all caught up!",
            style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 20, color: Color(0xFF212121)),
          ),
          const SizedBox(height: 8),
          const Text(
            'New roles are added regularly.\nCheck back soon.',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'Nunito', fontSize: 14, color: Color(0xFF8A8A9E)),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go('/matches'),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE91E63), elevation: 0),
            child: const Text('View my matches', style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _ErrorView({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Color(0xFFE91E63)),
          const SizedBox(height: 12),
          const Text('Something went wrong', style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 18)),
          const SizedBox(height: 20),
          ElevatedButton(onPressed: onRetry, child: const Text('Try again')),
        ],
      ),
    );
  }
}

class _MatchDialog extends StatelessWidget {
  final Job job;
  final MatchResult result;

  const _MatchDialog({required this.job, required this.result});

  @override
  Widget build(BuildContext context) {
    final color = Color(int.parse(job.color.replaceFirst('#', '0xFF')));
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(Icons.favorite, color: color, size: 32),
            ),
            const SizedBox(height: 16),
            const Text("It's a match!", style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w900, fontSize: 24, color: Color(0xFF212121))),
            const SizedBox(height: 8),
            Text(
              '${job.company} — ${job.title}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFF424242)),
            ),
            const SizedBox(height: 8),
            Text(
              '${result.score}% match • ${result.scoreLabel}',
              style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, fontSize: 13, color: color),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () { Navigator.pop(context); context.go('/matches'); },
                style: ElevatedButton.styleFrom(backgroundColor: color, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Send a message', style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, color: Colors.white)),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Keep swiping', style: TextStyle(fontFamily: 'Nunito', color: Color(0xFF8A8A9E))),
            ),
          ],
        ),
      ),
    );
  }
}
