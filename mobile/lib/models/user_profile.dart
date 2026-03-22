import 'package:cloud_firestore/cloud_firestore.dart';

class UserProfile {
  final String uid;
  final String displayName;
  final String photoURL;       // LinkedIn profile photo (no PII)
  final String specialism;     // e.g. 'ai-eng'
  final String specialismTitle; // e.g. 'AI Engineer'
  final List<String> topSkills; // exactly 5 selected during onboarding
  final String summary;        // AI-generated from LinkedIn experience (no numbers/emails)
  final String? cvImageURL;    // Firebase Storage URL of rendered CV page 1
  final String location;       // 'KL' | 'US' | 'London'
  final DateTime createdAt;
  final DateTime updatedAt;

  const UserProfile({
    required this.uid,
    required this.displayName,
    required this.photoURL,
    required this.specialism,
    required this.specialismTitle,
    required this.topSkills,
    required this.summary,
    this.cvImageURL,
    required this.location,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserProfile.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return UserProfile(
      uid: doc.id,
      displayName: d['displayName'] as String,
      photoURL: d['photoURL'] as String,
      specialism: d['specialism'] as String,
      specialismTitle: d['specialismTitle'] as String,
      topSkills: List<String>.from(d['topSkills'] ?? []),
      summary: d['summary'] as String,
      cvImageURL: d['cvImageURL'] as String?,
      location: d['location'] as String,
      createdAt: (d['createdAt'] as Timestamp).toDate(),
      updatedAt: (d['updatedAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toFirestore() => {
    'displayName': displayName,
    'photoURL': photoURL,
    'specialism': specialism,
    'specialismTitle': specialismTitle,
    'topSkills': topSkills,
    'summary': summary,
    if (cvImageURL != null) 'cvImageURL': cvImageURL,
    'location': location,
    'createdAt': Timestamp.fromDate(createdAt),
    'updatedAt': Timestamp.fromDate(updatedAt),
  };

  UserProfile copyWith({
    String? displayName,
    String? photoURL,
    String? specialism,
    String? specialismTitle,
    List<String>? topSkills,
    String? summary,
    String? cvImageURL,
    String? location,
  }) {
    return UserProfile(
      uid: uid,
      displayName: displayName ?? this.displayName,
      photoURL: photoURL ?? this.photoURL,
      specialism: specialism ?? this.specialism,
      specialismTitle: specialismTitle ?? this.specialismTitle,
      topSkills: topSkills ?? this.topSkills,
      summary: summary ?? this.summary,
      cvImageURL: cvImageURL ?? this.cvImageURL,
      location: location ?? this.location,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}
