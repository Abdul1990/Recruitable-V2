import 'package:cloud_firestore/cloud_firestore.dart';

enum InterviewStatus { pending, accepted, declined, completed, cancelled }
enum MeetingPlatform { zoom, googleMeet }

class Interview {
  final String id;
  final String matchId;
  final String candidateId;
  final String jobId;
  final String company;
  final String jobTitle;
  final DateTime scheduledAt;
  final int durationMinutes;
  final MeetingPlatform platform;
  final String meetingUrl;       // Join link for candidate
  final String? hostUrl;         // Host link for recruiter (zoom only)
  final String? meetingId;       // Zoom meeting ID or Google event ID
  final InterviewStatus status;
  final List<String> remindersSent; // ['24h', '1h'] — tracks which were sent
  final bool atsNoteCreated;
  final String? notes;           // Optional agenda from recruiter
  final DateTime createdAt;
  final DateTime updatedAt;

  const Interview({
    required this.id,
    required this.matchId,
    required this.candidateId,
    required this.jobId,
    required this.company,
    required this.jobTitle,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.platform,
    required this.meetingUrl,
    this.hostUrl,
    this.meetingId,
    required this.status,
    required this.remindersSent,
    required this.atsNoteCreated,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isPending => status == InterviewStatus.pending;
  bool get isAccepted => status == InterviewStatus.accepted;
  bool get isUpcoming =>
      isAccepted && scheduledAt.isAfter(DateTime.now());

  String get platformLabel =>
      platform == MeetingPlatform.zoom ? 'Zoom' : 'Google Meet';

  String get platformIcon =>
      platform == MeetingPlatform.zoom ? '📹' : '📅';

  String get statusLabel {
    switch (status) {
      case InterviewStatus.pending:   return 'Awaiting response';
      case InterviewStatus.accepted:  return 'Confirmed';
      case InterviewStatus.declined:  return 'Declined';
      case InterviewStatus.completed: return 'Completed';
      case InterviewStatus.cancelled: return 'Cancelled';
    }
  }

  factory Interview.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Interview(
      id: doc.id,
      matchId: d['matchId'] as String,
      candidateId: d['candidateId'] as String,
      jobId: d['jobId'] as String,
      company: d['company'] as String,
      jobTitle: d['jobTitle'] as String,
      scheduledAt: (d['scheduledAt'] as Timestamp).toDate(),
      durationMinutes: d['durationMinutes'] as int? ?? 45,
      platform: d['platform'] == 'zoom'
          ? MeetingPlatform.zoom
          : MeetingPlatform.googleMeet,
      meetingUrl: d['meetingUrl'] as String,
      hostUrl: d['hostUrl'] as String?,
      meetingId: d['meetingId'] as String?,
      status: InterviewStatus.values.firstWhere(
        (s) => s.name == d['status'],
        orElse: () => InterviewStatus.pending,
      ),
      remindersSent: List<String>.from(d['remindersSent'] ?? []),
      atsNoteCreated: d['atsNoteCreated'] as bool? ?? false,
      notes: d['notes'] as String?,
      createdAt: (d['createdAt'] as Timestamp).toDate(),
      updatedAt: (d['updatedAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toFirestore() => {
    'matchId': matchId,
    'candidateId': candidateId,
    'jobId': jobId,
    'company': company,
    'jobTitle': jobTitle,
    'scheduledAt': Timestamp.fromDate(scheduledAt),
    'durationMinutes': durationMinutes,
    'platform': platform.name,
    'meetingUrl': meetingUrl,
    if (hostUrl != null) 'hostUrl': hostUrl,
    if (meetingId != null) 'meetingId': meetingId,
    'status': status.name,
    'remindersSent': remindersSent,
    'atsNoteCreated': atsNoteCreated,
    if (notes != null) 'notes': notes,
    'createdAt': Timestamp.fromDate(createdAt),
    'updatedAt': Timestamp.fromDate(updatedAt),
  };
}
