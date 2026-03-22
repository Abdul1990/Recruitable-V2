import 'package:cloud_firestore/cloud_firestore.dart';
import '../config/app_config.dart';
import '../models/job.dart';
import '../models/match.dart';
import '../models/message.dart';
import '../models/user_profile.dart';
import 'auth_service.dart';

class FirestoreService {
  FirestoreService._();
  static final FirestoreService instance = FirestoreService._();

  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // ─── Users ───────────────────────────────────────────────────────────────

  Future<UserProfile?> getUser(String uid) async {
    final doc = await _db.collection(AppConfig.usersCol).doc(uid).get();
    if (!doc.exists) return null;
    return UserProfile.fromFirestore(doc);
  }

  Stream<UserProfile?> watchUser(String uid) {
    return _db
        .collection(AppConfig.usersCol)
        .doc(uid)
        .snapshots()
        .map((doc) => doc.exists ? UserProfile.fromFirestore(doc) : null);
  }

  /// Called after LinkedIn sign-in. Only writes if the user document doesn't exist yet,
  /// so returning users keep their onboarding data intact.
  Future<void> upsertUserFromLinkedIn({
    required String uid,
    required LinkedInProfile profile,
  }) async {
    final ref = _db.collection(AppConfig.usersCol).doc(uid);
    final doc = await ref.get();
    if (doc.exists) return; // Already onboarded — don't overwrite

    await ref.set({
      'displayName': profile.name,
      'photoURL': profile.picture ?? '',
      'specialism': '',
      'specialismTitle': '',
      'topSkills': <String>[],
      'summary': '',
      'location': '',
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> updateUserProfile(UserProfile profile) async {
    await _db.collection(AppConfig.usersCol).doc(profile.uid).update(
      profile.toFirestore()..['updatedAt'] = FieldValue.serverTimestamp(),
    );
  }

  Future<void> saveSpecialismAndSkills({
    required String uid,
    required String specialism,
    required String specialismTitle,
    required List<String> topSkills,
    required String summary,
    required String location,
  }) async {
    await _db.collection(AppConfig.usersCol).doc(uid).update({
      'specialism': specialism,
      'specialismTitle': specialismTitle,
      'topSkills': topSkills,
      'summary': summary,
      'location': location,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Updates only the user's location — called from LocationPickerScreen.
  /// Does not touch specialism or skills set during onboarding.
  Future<void> updateLocationOnly({required String uid, required String location}) async {
    await _db.collection(AppConfig.usersCol).doc(uid).update({
      'location': location,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> saveCvImageUrl(String uid, String cvImageURL) async {
    await _db.collection(AppConfig.usersCol).doc(uid).update({
      'cvImageURL': cvImageURL,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // ─── Jobs ─────────────────────────────────────────────────────────────────

  /// Fetches jobs for the swipe feed with APAC prioritisation.
  ///
  /// Strategy:
  ///   1. Fetch APAC-region jobs first (user's country + all other APAC markets)
  ///   2. Append non-APAC jobs (US, London) at the end
  ///
  /// This means a Malaysian developer sees KL/SG/AU roles at the top of their
  /// feed, but can still swipe on US/London roles further down.
  Future<List<Job>> getJobsForUser({
    required String userRegionCode,
    required String specialismCategory,
  }) async {
    // ── APAC jobs first ───────────────────────────────────────────────────
    final apacQuery = await _db
        .collection(AppConfig.jobsCol)
        .where('region', whereIn: AppConfig.apacRegionCodes)
        .orderBy('postedAt', descending: true)
        .get();

    final apacJobs = apacQuery.docs.map(Job.fromFirestore).toList();

    // Sort: user's own country at the very top, then rest of APAC
    apacJobs.sort((a, b) {
      final aIsHome = a.region == userRegionCode || (userRegionCode == 'MY' && a.region == 'KL');
      final bIsHome = b.region == userRegionCode || (userRegionCode == 'MY' && b.region == 'KL');
      if (aIsHome && !bIsHome) return -1;
      if (!aIsHome && bIsHome) return 1;
      return b.postedAt.compareTo(a.postedAt);
    });

    // ── Non-APAC jobs appended at the end ─────────────────────────────────
    final globalQuery = await _db
        .collection(AppConfig.jobsCol)
        .where('region', whereNotIn: AppConfig.apacRegionCodes)
        .orderBy('postedAt', descending: true)
        .limit(30)
        .get();

    final globalJobs = globalQuery.docs.map(Job.fromFirestore).toList();

    return [...apacJobs, ...globalJobs];
  }

  /// Fetches all active jobs — used when the user hasn't set their location yet.
  /// APAC jobs are still shown first by default.
  Future<List<Job>> getAllJobs() async {
    final apacQuery = await _db
        .collection(AppConfig.jobsCol)
        .where('region', whereIn: AppConfig.apacRegionCodes)
        .orderBy('postedAt', descending: true)
        .limit(80)
        .get();

    final globalQuery = await _db
        .collection(AppConfig.jobsCol)
        .where('region', whereNotIn: AppConfig.apacRegionCodes)
        .orderBy('postedAt', descending: true)
        .limit(20)
        .get();

    return [
      ...apacQuery.docs.map(Job.fromFirestore),
      ...globalQuery.docs.map(Job.fromFirestore),
    ];
  }

  // ─── Swipes ───────────────────────────────────────────────────────────────

  Future<void> recordSwipe({
    required String uid,
    required SwipeDecision decision,
  }) async {
    await _db
        .collection(AppConfig.swipesCol)
        .doc(uid)
        .collection('decisions')
        .doc(decision.jobId)
        .set(decision.toFirestore());
  }

  /// Returns the set of job IDs already swiped by this user (to exclude from feed).
  Future<Set<String>> getSwipedJobIds(String uid) async {
    final query = await _db
        .collection(AppConfig.swipesCol)
        .doc(uid)
        .collection('decisions')
        .get();
    return query.docs.map((d) => d.id).toSet();
  }

  // ─── Matches ──────────────────────────────────────────────────────────────

  Stream<List<Match>> watchMatches(String uid) {
    return _db
        .collection(AppConfig.matchesCol)
        .where('candidateId', isEqualTo: uid)
        .orderBy('unlockedAt', descending: true)
        .snapshots()
        .map((s) => s.docs.map(Match.fromFirestore).toList());
  }

  Future<Match?> createMatch({
    required String candidateId,
    required String jobId,
    required String company,
    required String jobTitle,
    required int matchScore,
  }) async {
    final ref = await _db.collection(AppConfig.matchesCol).add({
      'candidateId': candidateId,
      'jobId': jobId,
      'company': company,
      'jobTitle': jobTitle,
      'matchScore': matchScore,
      'hasUnreadMessages': false,
      'unlockedAt': FieldValue.serverTimestamp(),
    });
    final doc = await ref.get();
    return Match.fromFirestore(doc);
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  Stream<List<Message>> watchMessages(String matchId) {
    return _db
        .collection(AppConfig.messagesCol)
        .doc(matchId)
        .collection('thread')
        .orderBy('sentAt', descending: false)
        .snapshots()
        .map((s) => s.docs.map(Message.fromFirestore).toList());
  }

  Future<void> sendMessage(Message message) async {
    await _db
        .collection(AppConfig.messagesCol)
        .doc(message.matchId)
        .collection('thread')
        .add(message.toFirestore());

    // Mark match as having unread messages for the other party
    await _db.collection(AppConfig.matchesCol).doc(message.matchId).update({
      'hasUnreadMessages': true,
    });
  }

  Future<void> markMessagesRead(String matchId) async {
    await _db.collection(AppConfig.matchesCol).doc(matchId).update({
      'hasUnreadMessages': false,
    });
  }
}
