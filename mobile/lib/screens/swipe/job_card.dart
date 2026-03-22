import 'package:flutter/material.dart';
import '../../models/job.dart';
import '../../services/matching_service.dart';

class JobCard extends StatelessWidget {
  final Job job;
  final MatchResult matchResult;

  const JobCard({super.key, required this.job, required this.matchResult});

  Color get _cardColor => Color(int.parse(job.color.replaceFirst('#', '0xFF')));

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: _cardColor.withOpacity(0.18),
            blurRadius: 32,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header band
          Container(
            decoration: BoxDecoration(
              color: _cardColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Company initial avatar
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        job.company.substring(0, 1).toUpperCase(),
                        style: const TextStyle(
                          fontFamily: 'Nunito',
                          fontWeight: FontWeight.w800,
                          fontSize: 22,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            job.title,
                            style: const TextStyle(
                              fontFamily: 'Nunito',
                              fontWeight: FontWeight.w800,
                              fontSize: 20,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            job.company,
                            style: TextStyle(
                              fontFamily: 'Nunito',
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.85),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Match score badge
                    _MatchBadge(result: matchResult),
                  ],
                ),
              ],
            ),
          ),

          // Body
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Meta pills row
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      _MetaPill(icon: Icons.location_on_outlined, label: job.locationFull),
                      _MetaPill(icon: Icons.attach_money, label: job.salary),
                      if (job.badge != null)
                        _MetaPill(icon: Icons.local_fire_department, label: job.badge!, highlight: true),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Match reason from Claude
                  if (matchResult.reason.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF4F6FB),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFE8ECF4)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.auto_awesome, size: 14, color: Color(0xFFE91E63)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              matchResult.reason,
                              style: const TextStyle(
                                fontFamily: 'Nunito',
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                                color: Color(0xFF424242),
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 14),

                  // Description snippet
                  Expanded(
                    child: Text(
                      job.description,
                      maxLines: 6,
                      overflow: TextOverflow.fade,
                      style: const TextStyle(
                        fontFamily: 'Nunito',
                        fontWeight: FontWeight.w400,
                        fontSize: 13,
                        color: Color(0xFF616161),
                        height: 1.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Tech stack chips
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: job.stack.map((s) => _StackChip(label: s, color: _cardColor)).toList(),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          // Swipe hint footer
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0xFFE8ECF4))),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [
                  Icon(Icons.arrow_back, size: 14, color: Colors.red.shade300),
                  const SizedBox(width: 4),
                  Text('Pass', style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, fontSize: 12, color: Colors.red.shade300)),
                ]),
                Text(
                  job.posted,
                  style: const TextStyle(fontFamily: 'Nunito', fontSize: 11, color: Color(0xFF8A8A9E)),
                ),
                Row(children: [
                  Text('Interested', style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, fontSize: 12, color: Colors.green.shade500)),
                  const SizedBox(width: 4),
                  Icon(Icons.arrow_forward, size: 14, color: Colors.green.shade500),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MatchBadge extends StatelessWidget {
  final MatchResult result;
  const _MatchBadge({required this.result});

  @override
  Widget build(BuildContext context) {
    final bgColor = Color(int.parse(result.scoreColor.replaceFirst('#', '0xFF')));
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '${result.score}%',
            style: const TextStyle(
              fontFamily: 'Nunito',
              fontWeight: FontWeight.w900,
              fontSize: 18,
              color: Colors.white,
            ),
          ),
          Text(
            'match',
            style: TextStyle(
              fontFamily: 'Nunito',
              fontWeight: FontWeight.w700,
              fontSize: 9,
              color: Colors.white.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetaPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool highlight;

  const _MetaPill({required this.icon, required this.label, this.highlight = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: highlight ? const Color(0xFFFFE0EF) : const Color(0xFFF4F6FB),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: highlight ? const Color(0xFFE91E63) : const Color(0xFF8A8A9E)),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Nunito',
              fontWeight: FontWeight.w700,
              fontSize: 11,
              color: highlight ? const Color(0xFFE91E63) : const Color(0xFF424242),
            ),
          ),
        ],
      ),
    );
  }
}

class _StackChip extends StatelessWidget {
  final String label;
  final Color color;

  const _StackChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Nunito',
          fontWeight: FontWeight.w700,
          fontSize: 10,
          color: color,
        ),
      ),
    );
  }
}
