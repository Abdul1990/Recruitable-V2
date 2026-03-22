// App-wide constants and configuration.
// All API keys must be loaded from environment or .env — never hardcoded.

class AppConfig {
  AppConfig._();

  // Base URL of the recruitable.asia Next.js backend
  static const String apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'https://recruitable.asia');

  // Claude API is called server-side via /api/match-score — never expose key in app
  static const String matchScoreEndpoint = '$apiBaseUrl/api/match-score';
  static const String cvUploadEndpoint = '$apiBaseUrl/api/cv-upload';

  // LinkedIn OAuth — registered at https://www.linkedin.com/developers/apps
  static const String linkedInClientId =
      String.fromEnvironment('LINKEDIN_CLIENT_ID', defaultValue: '');
  static const String linkedInRedirectUri = '$apiBaseUrl/api/auth/linkedin/callback';
  static const String linkedInScope = 'openid profile email w_member_social';

  // Swipe thresholds
  static const int minMatchScore = 60; // % — cards below this are filtered out
  static const int topMatchScore = 85; // % — shown with "Strong Match" badge

  // Firestore collection names
  static const String usersCol = 'users';
  static const String jobsCol = 'jobs';
  static const String swipesCol = 'swipes';
  static const String matchesCol = 'matches';
  static const String messagesCol = 'messages';

  // ─── APAC Regions ──────────────────────────────────────────────────────────
  // Primary focus markets. Jobs tagged with these region codes are shown first
  // in the swipe feed. Non-APAC jobs (US, London) appear at the end of the feed
  // so the app works globally but prioritises APAC talent.

  static const List<ApacRegion> apacRegions = [
    ApacRegion(code: 'MY', label: 'Malaysia', city: 'Kuala Lumpur', flag: '🇲🇾'),
    ApacRegion(code: 'SG', label: 'Singapore', city: 'Singapore', flag: '🇸🇬'),
    ApacRegion(code: 'AU', label: 'Australia', city: 'Sydney / Melbourne', flag: '🇦🇺'),
    ApacRegion(code: 'VN', label: 'Vietnam', city: 'Ho Chi Minh City / Hanoi', flag: '🇻🇳'),
    ApacRegion(code: 'ID', label: 'Indonesia', city: 'Jakarta', flag: '🇮🇩'),
    ApacRegion(code: 'TH', label: 'Thailand', city: 'Bangkok', flag: '🇹🇭'),
  ];

  // Firestore region codes that count as APAC (used for feed prioritisation)
  // 'KL' is the legacy code for Malaysia from the existing website data.
  static const List<String> apacRegionCodes = ['MY', 'KL', 'SG', 'AU', 'VN', 'ID', 'TH'];

  static bool isApac(String regionCode) => apacRegionCodes.contains(regionCode);
}

class ApacRegion {
  final String code;
  final String label;
  final String city;
  final String flag;

  const ApacRegion({
    required this.code,
    required this.label,
    required this.city,
    required this.flag,
  });
}
