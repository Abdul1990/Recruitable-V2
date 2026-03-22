import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../config/app_config.dart';
import '../models/interview.dart';
import '../models/match.dart';

class InterviewService {
  InterviewService._();
  static final InterviewService instance = InterviewService._();

  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // ─── Book an interview (called by recruiter side) ─────────────────────────

  Future<Interview?> bookInterview({
    required Match match,
    required DateTime scheduledAt,
    required int durationMinutes,
    required MeetingPlatform platform,
    String? notes,
  }) async {
    final res = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/api/interviews/create'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'matchId': match.id,
        'candidateId': match.candidateId,
        'jobId': match.jobId,
        'company': match.company,
        'jobTitle': match.jobTitle,
        'scheduledAt': scheduledAt.toIso8601String(),
        'durationMinutes': durationMinutes,
        'platform': platform.name,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      }),
    );

    if (res.statusCode != 201) return null;
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final doc = await _db.collection('interviews').doc(data['interviewId'] as String).get();
    return doc.exists ? Interview.fromFirestore(doc) : null;
  }

  // ─── Respond to interview request (candidate) ─────────────────────────────

  Future<bool> respondToInterview({
    required String interviewId,
    required bool accept,
  }) async {
    final res = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/api/interviews/respond'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'interviewId': interviewId,
        'response': accept ? 'accepted' : 'declined',
      }),
    );
    return res.statusCode == 200;
  }

  // ─── Firestore streams ────────────────────────────────────────────────────

  /// All interviews for a candidate — used on the Upcoming Interviews screen.
  Stream<List<Interview>> watchCandidateInterviews(String candidateId) {
    return _db
        .collection('interviews')
        .where('candidateId', isEqualTo: candidateId)
        .where('status', whereIn: ['pending', 'accepted'])
        .orderBy('scheduledAt', descending: false)
        .snapshots()
        .map((s) => s.docs.map(Interview.fromFirestore).toList());
  }

  /// Single interview linked to a match — shown in the chat thread.
  Stream<Interview?> watchMatchInterview(String matchId) {
    return _db
        .collection('interviews')
        .where('matchId', isEqualTo: matchId)
        .where('status', whereNotIn: ['declined', 'cancelled'])
        .orderBy('createdAt', descending: true)
        .limit(1)
        .snapshots()
        .map((s) => s.docs.isEmpty ? null : Interview.fromFirestore(s.docs.first));
  }

  // ─── Launch meeting ───────────────────────────────────────────────────────

  Future<void> joinMeeting(Interview interview) async {
    final uri = Uri.parse(interview.meetingUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
