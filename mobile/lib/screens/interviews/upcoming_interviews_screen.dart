import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/interview.dart';
import '../../services/auth_service.dart';
import '../../services/interview_service.dart';
import 'interview_card.dart';

class UpcomingInterviewsScreen extends StatelessWidget {
  const UpcomingInterviewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.instance.currentUser?.uid ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('Interviews',
            style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF212121))),
      ),
      body: StreamBuilder<List<Interview>>(
        stream: InterviewService.instance.watchCandidateInterviews(uid),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFE91E63)));
          }

          final interviews = snapshot.data ?? [];

          if (interviews.isEmpty) {
            return const _EmptyInterviews();
          }

          // Split into pending requests and confirmed/upcoming
          final pending = interviews.where((i) => i.isPending).toList();
          final upcoming = interviews.where((i) => i.isAccepted).toList();

          return ListView(
            padding: const EdgeInsets.symmetric(vertical: 8),
            children: [
              if (pending.isNotEmpty) ...[
                _GroupHeader(label: 'Awaiting your response', count: pending.length, color: const Color(0xFFF57F17)),
                ...pending.map((i) => InterviewCard(interview: i)),
              ],
              if (upcoming.isNotEmpty) ...[
                _GroupHeader(label: 'Confirmed', count: upcoming.length, color: const Color(0xFF2E7D32)),
                ...upcoming.map((i) => InterviewCard(interview: i)),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _GroupHeader extends StatelessWidget {
  final String label;
  final int count;
  final Color color;
  const _GroupHeader({required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 6),
      child: Row(children: [
        Text(label,
            style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 13, color: color)),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
          decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
          child: Text('$count', style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 11, color: color)),
        ),
      ]),
    );
  }
}

class _EmptyInterviews extends StatelessWidget {
  const _EmptyInterviews();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.event_available_outlined, size: 56, color: Color(0xFFE0E0E0)),
          SizedBox(height: 16),
          Text('No interviews yet',
              style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF212121))),
          SizedBox(height: 8),
          Text('Interview requests from companies\nwill appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(fontFamily: 'Nunito', fontSize: 14, color: Color(0xFF8A8A9E))),
        ],
      ),
    );
  }
}
