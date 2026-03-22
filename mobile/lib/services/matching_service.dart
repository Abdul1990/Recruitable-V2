import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../models/job.dart';
import '../models/user_profile.dart';

class MatchResult {
  final int score;      // 0–100
  final String reason;  // 1-sentence explanation from Claude

  const MatchResult({required this.score, required this.reason});

  bool get isMatch => score >= AppConfig.minMatchScore;
  bool get isStrongMatch => score >= AppConfig.topMatchScore;

  String get scoreLabel {
    if (score >= 90) return 'Exceptional';
    if (score >= AppConfig.topMatchScore) return 'Strong Match';
    if (score >= AppConfig.minMatchScore) return 'Good Match';
    return 'Partial Match';
  }

  String get scoreColor {
    if (score >= 90) return '#E91E63';
    if (score >= AppConfig.topMatchScore) return '#FF9400';
    if (score >= AppConfig.minMatchScore) return '#03A9F4';
    return '#8A8A9E';
  }
}

class MatchingService {
  MatchingService._();
  static final MatchingService instance = MatchingService._();

  /// Calls the Next.js /api/match-score endpoint which in turn calls Claude.
  /// Claude scoring is always server-side — the API key never leaves the backend.
  Future<MatchResult> scoreCandidate({
    required UserProfile candidate,
    required Job job,
  }) async {
    try {
      final res = await http.post(
        Uri.parse(AppConfig.matchScoreEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'candidate': {
            'specialism': candidate.specialismTitle,
            'skills': candidate.topSkills,
            'summary': candidate.summary,
            'location': candidate.location,
          },
          'job': {
            'title': job.title,
            'company': job.company,
            'region': job.region,
            'type': job.type,
            'stack': job.stack,
            'description': job.description,
          },
        }),
      );

      if (res.statusCode != 200) {
        return const MatchResult(score: 0, reason: 'Scoring unavailable');
      }

      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return MatchResult(
        score: (data['score'] as num).toInt(),
        reason: data['reason'] as String? ?? '',
      );
    } catch (_) {
      return const MatchResult(score: 0, reason: 'Scoring unavailable');
    }
  }

  /// Pre-scores a batch of jobs and returns only those meeting the threshold,
  /// sorted by score descending. Used to pre-populate the swipe feed.
  Future<List<({Job job, MatchResult result})>> buildScoredFeed({
    required UserProfile candidate,
    required List<Job> jobs,
    required Set<String> alreadySwiped,
  }) async {
    final unseen = jobs.where((j) => !alreadySwiped.contains(j.id)).toList();

    // Score concurrently (max 5 at a time to avoid flooding the API)
    final results = <({Job job, MatchResult result})>[];
    const batchSize = 5;

    for (var i = 0; i < unseen.length; i += batchSize) {
      final batch = unseen.skip(i).take(batchSize).toList();
      final scored = await Future.wait(
        batch.map((job) async {
          final result = await scoreCandidate(candidate: candidate, job: job);
          return (job: job, result: result);
        }),
      );
      results.addAll(scored.where((r) => r.result.isMatch));
    }

    results.sort((a, b) => b.result.score.compareTo(a.result.score));
    return results;
  }
}
