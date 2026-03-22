import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../config/app_config.dart';
import '../../services/auth_service.dart';

class LinkedInAuthScreen extends StatefulWidget {
  const LinkedInAuthScreen({super.key});

  @override
  State<LinkedInAuthScreen> createState() => _LinkedInAuthScreenState();
}

class _LinkedInAuthScreenState extends State<LinkedInAuthScreen> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) => setState(() => _loading = true),
        onPageFinished: (_) => setState(() => _loading = false),
        onNavigationRequest: (req) {
          if (req.url.startsWith(AppConfig.linkedInRedirectUri)) {
            _handleCallback(req.url);
            return NavigationDecision.prevent;
          }
          return NavigationDecision.navigate;
        },
      ))
      ..loadRequest(Uri.parse(AuthService.instance.getLinkedInAuthUrl()));
  }

  Future<void> _handleCallback(String url) async {
    final uri = Uri.parse(url);
    final code = uri.queryParameters['code'];
    if (code == null) {
      if (mounted) context.go('/');
      return;
    }

    setState(() => _loading = true);
    final profile = await AuthService.instance.exchangeLinkedInCode(code);

    if (!mounted) return;
    if (profile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in failed. Please try again.')),
      );
      context.go('/');
      return;
    }

    // Navigate to skill selection (new users) or feed (returning users)
    context.go('/onboarding/skills');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            // Recruitable puzzle logo
            Container(
              width: 28,
              height: 28,
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
                fontFamily: 'Nunito',
                fontWeight: FontWeight.w800,
                color: Color(0xFF212121),
                fontSize: 18,
              ),
            ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF212121)),
          onPressed: () => context.go('/'),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFFE91E63)),
            ),
        ],
      ),
    );
  }
}
