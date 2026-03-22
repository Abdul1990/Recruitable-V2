// Displayed inside the chat thread whenever an interview exists for this match.
// Pending: candidate sees Accept / Decline buttons.
// Accepted: shows meeting details + "Join" button + countdown.

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/interview.dart';
import '../../services/interview_service.dart';

class InterviewCard extends StatefulWidget {
  final Interview interview;
  const InterviewCard({super.key, required this.interview});

  @override
  State<InterviewCard> createState() => _InterviewCardState();
}

class _InterviewCardState extends State<InterviewCard> {
  bool _responding = false;

  Future<void> _respond(bool accept) async {
    setState(() => _responding = true);
    final ok = await InterviewService.instance.respondToInterview(
      interviewId: widget.interview.id,
      accept: accept,
    );
    if (mounted) {
      setState(() => _responding = false);
      if (!ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not respond. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final interview = widget.interview;
    final color = interview.platform == MeetingPlatform.zoom
        ? const Color(0xFF3F51B5)
        : const Color(0xFF03A9F4);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withOpacity(0.25), width: 1.5),
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.07),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            ),
            child: Row(children: [
              Text(interview.platformIcon, style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Interview via ${interview.platformLabel}',
                      style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 14, color: color)),
                  Text(interview.company,
                      style: const TextStyle(fontFamily: 'Nunito', fontSize: 12, color: Color(0xFF8A8A9E))),
                ]),
              ),
              _StatusBadge(status: interview.status),
            ]),
          ),

          // Details
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _DetailRow(icon: Icons.work_outline, text: interview.jobTitle),
              const SizedBox(height: 8),
              _DetailRow(
                icon: Icons.event,
                text: DateFormat('EEEE, d MMMM yyyy').format(interview.scheduledAt),
              ),
              const SizedBox(height: 4),
              _DetailRow(
                icon: Icons.access_time,
                text: '${DateFormat('h:mm a').format(interview.scheduledAt)} · ${interview.durationMinutes} minutes',
              ),
              if (interview.notes != null && interview.notes!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF4F6FB),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Icon(Icons.notes, size: 14, color: Color(0xFF8A8A9E)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(interview.notes!,
                        style: const TextStyle(fontFamily: 'Nunito', fontSize: 12, color: Color(0xFF616161)))),
                  ]),
                ),
              ],
              if (interview.isAccepted) _CountdownBanner(scheduledAt: interview.scheduledAt),
            ]),
          ),

          // Action buttons
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: _buildActions(color),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(Color color) {
    final interview = widget.interview;

    if (interview.isPending) {
      return Row(children: [
        Expanded(
          child: OutlinedButton(
            onPressed: _responding ? null : () => _respond(false),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFE0E0E0)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Decline',
                style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, color: Color(0xFF8A8A9E))),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: ElevatedButton(
            onPressed: _responding ? null : () => _respond(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: color,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: _responding
                ? const SizedBox(width: 16, height: 16,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Accept',
                    style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, color: Colors.white)),
          ),
        ),
      ]);
    }

    if (interview.isAccepted) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: () => InterviewService.instance.joinMeeting(interview),
          icon: const Icon(Icons.videocam, color: Colors.white, size: 18),
          label: Text('Join ${interview.platformLabel}',
              style: const TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: color,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      );
    }

    if (interview.status == InterviewStatus.declined) {
      return const Center(
        child: Text('You declined this interview.',
            style: TextStyle(fontFamily: 'Nunito', fontSize: 13, color: Color(0xFF8A8A9E))),
      );
    }

    return const SizedBox.shrink();
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _DetailRow({required this.icon, required this.text});
  @override
  Widget build(BuildContext context) => Row(children: [
    Icon(icon, size: 14, color: const Color(0xFF8A8A9E)),
    const SizedBox(width: 8),
    Expanded(child: Text(text,
        style: const TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF424242)))),
  ]);
}

class _StatusBadge extends StatelessWidget {
  final InterviewStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg; Color fg; String label;
    switch (status) {
      case InterviewStatus.pending:
        bg = const Color(0xFFFFF8E1); fg = const Color(0xFFF57F17); label = 'Pending';
        break;
      case InterviewStatus.accepted:
        bg = const Color(0xFFE8F5E9); fg = const Color(0xFF2E7D32); label = 'Confirmed';
        break;
      case InterviewStatus.declined:
        bg = const Color(0xFFFFEBEE); fg = const Color(0xFFC62828); label = 'Declined';
        break;
      default:
        bg = const Color(0xFFF4F6FB); fg = const Color(0xFF8A8A9E); label = 'Done';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, fontSize: 11, color: fg)),
    );
  }
}

class _CountdownBanner extends StatelessWidget {
  final DateTime scheduledAt;
  const _CountdownBanner({required this.scheduledAt});

  String _label() {
    final diff = scheduledAt.difference(DateTime.now());
    if (diff.isNegative) return 'Happening now';
    if (diff.inHours < 1) return 'In ${diff.inMinutes} minutes';
    if (diff.inHours < 24) return 'In ${diff.inHours} hours';
    if (diff.inDays == 1) return 'Tomorrow';
    return 'In ${diff.inDays} days';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFE8F5E9),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.alarm, size: 14, color: Color(0xFF2E7D32)),
          const SizedBox(width: 6),
          Text(_label(),
              style: const TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFF2E7D32))),
        ]),
      ),
    );
  }
}
