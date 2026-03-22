import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/interview.dart';
import '../../models/match.dart';
import '../../services/interview_service.dart';

class BookInterviewScreen extends StatefulWidget {
  final Match match;
  const BookInterviewScreen({super.key, required this.match});

  @override
  State<BookInterviewScreen> createState() => _BookInterviewScreenState();
}

class _BookInterviewScreenState extends State<BookInterviewScreen> {
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  int _duration = 45;
  MeetingPlatform _platform = MeetingPlatform.googleMeet;
  final _notesController = TextEditingController();
  bool _booking = false;

  static const _durations = [30, 45, 60, 90];

  DateTime? get _scheduledAt {
    if (_selectedDate == null || _selectedTime == null) return null;
    return DateTime(
      _selectedDate!.year, _selectedDate!.month, _selectedDate!.day,
      _selectedTime!.hour, _selectedTime!.minute,
    );
  }

  bool get _canBook =>
      _scheduledAt != null &&
      _scheduledAt!.isAfter(DateTime.now()) &&
      !_booking;

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 60)),
      builder: (ctx, child) => Theme(
        data: ThemeData.light().copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFFE91E63)),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 10, minute: 0),
      builder: (ctx, child) => Theme(
        data: ThemeData.light().copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFFE91E63)),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedTime = picked);
  }

  Future<void> _book() async {
    if (!_canBook) return;
    setState(() => _booking = true);

    final interview = await InterviewService.instance.bookInterview(
      match: widget.match,
      scheduledAt: _scheduledAt!,
      durationMinutes: _duration,
      platform: _platform,
      notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
    );

    if (!mounted) return;
    setState(() => _booking = false);

    if (interview != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Interview request sent to candidate'),
          backgroundColor: Color(0xFF00BCD4),
        ),
      );
      context.pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not book interview. Please try again.'),
          backgroundColor: Color(0xFFE91E63),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Color(0xFF212121)),
          onPressed: () => context.pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Book interview',
                style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF212121))),
            Text(widget.match.jobTitle,
                style: const TextStyle(fontFamily: 'Nunito', fontSize: 12, color: Color(0xFF8A8A9E))),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // ── Platform picker ──────────────────────────────────────────────
          _SectionLabel(label: 'Video platform'),
          const SizedBox(height: 10),
          Row(children: [
            _PlatformChip(
              label: 'Google Meet',
              icon: '📅',
              color: const Color(0xFF03A9F4),
              selected: _platform == MeetingPlatform.googleMeet,
              onTap: () => setState(() => _platform = MeetingPlatform.googleMeet),
            ),
            const SizedBox(width: 12),
            _PlatformChip(
              label: 'Zoom',
              icon: '📹',
              color: const Color(0xFF3F51B5),
              selected: _platform == MeetingPlatform.zoom,
              onTap: () => setState(() => _platform = MeetingPlatform.zoom),
            ),
          ]),
          const SizedBox(height: 24),

          // ── Date ─────────────────────────────────────────────────────────
          _SectionLabel(label: 'Date'),
          const SizedBox(height: 10),
          _PickerTile(
            icon: Icons.calendar_today_outlined,
            label: _selectedDate == null
                ? 'Select date'
                : DateFormat('EEEE, d MMMM yyyy').format(_selectedDate!),
            filled: _selectedDate != null,
            onTap: _pickDate,
          ),
          const SizedBox(height: 12),

          // ── Time ─────────────────────────────────────────────────────────
          _SectionLabel(label: 'Time'),
          const SizedBox(height: 10),
          _PickerTile(
            icon: Icons.access_time_outlined,
            label: _selectedTime == null
                ? 'Select time'
                : _selectedTime!.format(context),
            filled: _selectedTime != null,
            onTap: _pickTime,
          ),
          const SizedBox(height: 24),

          // ── Duration ─────────────────────────────────────────────────────
          _SectionLabel(label: 'Duration'),
          const SizedBox(height: 10),
          Row(
            children: _durations.map((d) {
              final selected = _duration == d;
              return Padding(
                padding: const EdgeInsets.only(right: 10),
                child: GestureDetector(
                  onTap: () => setState(() => _duration = d),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: selected ? const Color(0xFFE91E63) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: selected ? const Color(0xFFE91E63) : const Color(0xFFE0E0E0),
                      ),
                    ),
                    child: Text(
                      '${d}m',
                      style: TextStyle(
                        fontFamily: 'Nunito',
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: selected ? Colors.white : const Color(0xFF424242),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          // ── Agenda / notes ────────────────────────────────────────────────
          _SectionLabel(label: 'Agenda (optional)'),
          const SizedBox(height: 10),
          TextField(
            controller: _notesController,
            maxLines: 4,
            maxLength: 400,
            decoration: InputDecoration(
              hintText: 'e.g. Technical discussion, system design, culture fit...',
              hintStyle: const TextStyle(fontFamily: 'Nunito', color: Color(0xFFBDBDBD), fontSize: 13),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFE91E63)),
              ),
            ),
          ),

          // ── Summary card ──────────────────────────────────────────────────
          if (_scheduledAt != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFA5D6A7)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Interview summary',
                      style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF2E7D32))),
                  const SizedBox(height: 8),
                  _SummaryRow(icon: Icons.business, text: widget.match.company),
                  _SummaryRow(icon: Icons.work_outline, text: widget.match.jobTitle),
                  _SummaryRow(
                    icon: Icons.event,
                    text: '${DateFormat('EEE d MMM, h:mm a').format(_scheduledAt!)} · ${_duration}min',
                  ),
                  _SummaryRow(
                    icon: _platform == MeetingPlatform.zoom ? Icons.videocam : Icons.video_call,
                    text: _platform == MeetingPlatform.zoom ? 'Zoom meeting (link auto-generated)' : 'Google Meet (link auto-generated)',
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 32),
        ],
      ),

      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          child: SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: _canBook ? _book : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE91E63),
                disabledBackgroundColor: const Color(0xFFE0E0E0),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: _booking
                  ? const SizedBox(width: 22, height: 22,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                  : const Text('Send interview request',
                      style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 16, color: Colors.white)),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});
  @override
  Widget build(BuildContext context) => Text(label,
      style: const TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF212121)));
}

class _PlatformChip extends StatelessWidget {
  final String label, icon;
  final Color color;
  final bool selected;
  final VoidCallback onTap;
  const _PlatformChip({required this.label, required this.icon, required this.color, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? color : const Color(0xFFE0E0E0), width: selected ? 2 : 1),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Text(icon, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, fontSize: 14,
              color: selected ? color : const Color(0xFF424242))),
          if (selected) ...[const SizedBox(width: 6), Icon(Icons.check_circle, color: color, size: 16)],
        ]),
      ),
    );
  }
}

class _PickerTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool filled;
  final VoidCallback onTap;
  const _PickerTile({required this.icon, required this.label, required this.filled, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: filled ? const Color(0xFFE91E63) : const Color(0xFFE0E0E0)),
        ),
        child: Row(children: [
          Icon(icon, size: 18, color: filled ? const Color(0xFFE91E63) : const Color(0xFF8A8A9E)),
          const SizedBox(width: 12),
          Text(label, style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w600, fontSize: 14,
              color: filled ? const Color(0xFF212121) : const Color(0xFF8A8A9E))),
          const Spacer(),
          Icon(Icons.chevron_right, size: 18, color: const Color(0xFFBDBDBD)),
        ]),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _SummaryRow({required this.icon, required this.text});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(children: [
        Icon(icon, size: 14, color: const Color(0xFF2E7D32)),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: const TextStyle(fontFamily: 'Nunito', fontSize: 13, color: Color(0xFF2E7D32)))),
      ]),
    );
  }
}
