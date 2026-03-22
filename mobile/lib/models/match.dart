import 'package:cloud_firestore/cloud_firestore.dart';

enum SwipeDirection { right, left }

class SwipeDecision {
  final String jobId;
  final SwipeDirection direction;
  final int matchScore;    // 0–100 from Claude API
  final String matchReason; // 1-sentence explanation
  final DateTime decidedAt;

  const SwipeDecision({
    required this.jobId,
    required this.direction,
    required this.matchScore,
    required this.matchReason,
    required this.decidedAt,
  });

  Map<String, dynamic> toFirestore() => {
    'jobId': jobId,
    'direction': direction.name,
    'matchScore': matchScore,
    'matchReason': matchReason,
    'decidedAt': Timestamp.fromDate(decidedAt),
  };
}

class Match {
  final String id;
  final String candidateId;
  final String jobId;
  final String company;
  final String jobTitle;
  final int matchScore;
  final DateTime unlockedAt;
  final bool hasUnreadMessages;

  const Match({
    required this.id,
    required this.candidateId,
    required this.jobId,
    required this.company,
    required this.jobTitle,
    required this.matchScore,
    required this.unlockedAt,
    this.hasUnreadMessages = false,
  });

  factory Match.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Match(
      id: doc.id,
      candidateId: d['candidateId'] as String,
      jobId: d['jobId'] as String,
      company: d['company'] as String,
      jobTitle: d['jobTitle'] as String,
      matchScore: d['matchScore'] as int,
      unlockedAt: (d['unlockedAt'] as Timestamp).toDate(),
      hasUnreadMessages: d['hasUnreadMessages'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toFirestore() => {
    'candidateId': candidateId,
    'jobId': jobId,
    'company': company,
    'jobTitle': jobTitle,
    'matchScore': matchScore,
    'unlockedAt': Timestamp.fromDate(unlockedAt),
    'hasUnreadMessages': hasUnreadMessages,
  };
}
