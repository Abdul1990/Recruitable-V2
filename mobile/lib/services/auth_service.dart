import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'firestore_service.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  Stream<User?> get authStateChanges => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  // ─── LinkedIn OAuth ───────────────────────────────────────────────────────
  // LinkedIn uses standard OAuth2. We launch a WebView to the LinkedIn
  // authorization URL, capture the code on redirect, exchange for tokens
  // server-side, then sign into Firebase with a custom token.

  /// Returns the LinkedIn authorization URL to load in a WebView.
  String getLinkedInAuthUrl() {
    final params = Uri(queryParameters: {
      'response_type': 'code',
      'client_id': AppConfig.linkedInClientId,
      'redirect_uri': AppConfig.linkedInRedirectUri,
      'scope': AppConfig.linkedInScope,
      'state': _generateState(),
    });
    return 'https://www.linkedin.com/oauth/v2/authorization${params.query.isEmpty ? '' : '?${params.query}'}';
  }

  /// Called after the WebView captures the OAuth code.
  /// Exchanges code for profile + Firebase custom token via backend.
  Future<LinkedInProfile?> exchangeLinkedInCode(String code) async {
    final res = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/api/auth/linkedin'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'code': code}),
    );

    if (res.statusCode != 200) return null;

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final firebaseToken = data['firebaseToken'] as String;
    final profile = LinkedInProfile.fromJson(data['profile'] as Map<String, dynamic>);

    // Sign into Firebase with the custom token from our backend
    await _auth.signInWithCustomToken(firebaseToken);

    // Persist token for session refresh
    await _secureStorage.write(key: 'linkedin_access_token', value: data['accessToken'] as String?);

    // Upsert profile in Firestore (first-time only; existing profiles are not overwritten)
    await FirestoreService.instance.upsertUserFromLinkedIn(
      uid: _auth.currentUser!.uid,
      profile: profile,
    );

    return profile;
  }

  Future<void> signOut() async {
    await _auth.signOut();
    await _secureStorage.delete(key: 'linkedin_access_token');
  }

  String _generateState() =>
      base64Url.encode(List<int>.generate(16, (_) => DateTime.now().microsecondsSinceEpoch & 0xFF));
}

// ─── LinkedIn Profile DTO ─────────────────────────────────────────────────────

class LinkedInProfile {
  final String sub;            // LinkedIn member ID
  final String name;
  final String givenName;
  final String familyName;
  final String? picture;       // profile photo URL
  final String? headline;
  final List<LinkedInPosition> positions;

  const LinkedInProfile({
    required this.sub,
    required this.name,
    required this.givenName,
    required this.familyName,
    this.picture,
    this.headline,
    required this.positions,
  });

  factory LinkedInProfile.fromJson(Map<String, dynamic> json) {
    return LinkedInProfile(
      sub: json['sub'] as String,
      name: json['name'] as String,
      givenName: json['given_name'] as String,
      familyName: json['family_name'] as String,
      picture: json['picture'] as String?,
      headline: json['headline'] as String?,
      positions: (json['positions'] as List<dynamic>? ?? [])
          .map((p) => LinkedInPosition.fromJson(p as Map<String, dynamic>))
          .toList(),
    );
  }
}

class LinkedInPosition {
  final String title;
  final String company;
  final String? startDate;
  final String? endDate;
  final String? description; // PII is stripped server-side before this reaches the app

  const LinkedInPosition({
    required this.title,
    required this.company,
    this.startDate,
    this.endDate,
    this.description,
  });

  factory LinkedInPosition.fromJson(Map<String, dynamic> json) {
    return LinkedInPosition(
      title: json['title'] as String,
      company: json['company'] as String,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
      description: json['description'] as String?,
    );
  }
}
