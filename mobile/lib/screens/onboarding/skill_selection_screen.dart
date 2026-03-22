import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../config/app_config.dart';
import '../../data/specialisms.dart';
import '../../services/auth_service.dart';
import '../../services/firestore_service.dart';

class SkillSelectionScreen extends StatefulWidget {
  const SkillSelectionScreen({super.key});

  @override
  State<SkillSelectionScreen> createState() => _SkillSelectionScreenState();
}

class _SkillSelectionScreenState extends State<SkillSelectionScreen> {
  final Set<String> _selected = {};
  static const int maxSkills = 5;
  bool _saving = false;

  // Category filter
  final List<String> _categories = ['All', 'AI & ML', 'Software Engineering', 'Data', 'Product'];
  String _activeCategory = 'All';

  List<String> get _filteredSkills {
    if (_activeCategory == 'All') return kAllSkills;
    final spec = kSpecialisms.where((s) => s.category == _activeCategory);
    final skills = <String>{};
    for (final s in spec) {
      skills.addAll(s.coreSkills);
    }
    return skills.toList();
  }

  Specialism? get _predictedSpecialism =>
      _selected.length >= 2 ? resolveSpecialism(_selected.toList()) : null;

  Future<void> _confirm() async {
    if (_selected.length < 5 || _saving) return;
    setState(() => _saving = true);

    final uid = AuthService.instance.currentUser?.uid;
    if (uid == null) {
      setState(() => _saving = false);
      return;
    }

    final specialism = resolveSpecialism(_selected.toList());

    // Ask Claude to summarise the user's LinkedIn profile into a clean bio
    final summary = await _generateSummary(uid);

    await FirestoreService.instance.saveSpecialismAndSkills(
      uid: uid,
      specialism: specialism.id,
      specialismTitle: specialism.title,
      topSkills: _selected.toList(),
      summary: summary,
      location: '',  // Set on next step (location picker) or via profile edit
    );

    if (mounted) context.go('/onboarding/location');
  }

  Future<String> _generateSummary(String uid) async {
    try {
      final res = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/api/summarise-profile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'uid': uid}),
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        return data['summary'] as String? ?? '';
      }
    } catch (_) {}
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final predicted = _predictedSpecialism;
    final remaining = maxSkills - _selected.length;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Your top 5 skills',
          style: TextStyle(
            fontFamily: 'Nunito',
            fontWeight: FontWeight.w800,
            color: Color(0xFF212121),
            fontSize: 18,
          ),
        ),
      ),
      body: Column(
        children: [
          // Instruction banner
          Container(
            width: double.infinity,
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  remaining > 0
                      ? 'Pick $remaining more skill${remaining == 1 ? '' : 's'}'
                      : 'Great! You\'ve selected 5 skills.',
                  style: TextStyle(
                    fontFamily: 'Nunito',
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    color: remaining > 0 ? const Color(0xFF8A8A9E) : const Color(0xFF00BCD4),
                  ),
                ),
                if (predicted != null) ...[
                  const SizedBox(height: 8),
                  _SpecialismPreviewChip(specialism: predicted),
                ],
              ],
            ),
          ),

          // Category filter tabs
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              children: _categories.map((cat) {
                final active = cat == _activeCategory;
                return GestureDetector(
                  onTap: () => setState(() => _activeCategory = cat),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    decoration: BoxDecoration(
                      color: active ? const Color(0xFFE91E63) : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: active ? const Color(0xFFE91E63) : const Color(0xFFE0E0E0),
                      ),
                    ),
                    child: Text(
                      cat,
                      style: TextStyle(
                        fontFamily: 'Nunito',
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: active ? Colors.white : const Color(0xFF424242),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Skills grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 160,
                childAspectRatio: 2.8,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: _filteredSkills.length,
              itemBuilder: (context, i) {
                final skill = _filteredSkills[i];
                final isSelected = _selected.contains(skill);
                final isDisabled = !isSelected && _selected.length >= maxSkills;

                return GestureDetector(
                  onTap: isDisabled
                      ? null
                      : () => setState(() {
                            if (isSelected) {
                              _selected.remove(skill);
                            } else {
                              _selected.add(skill);
                            }
                          }),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFFE91E63)
                          : isDisabled
                              ? const Color(0xFFF4F6FB)
                              : Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFFE91E63)
                            : const Color(0xFFE0E0E0),
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      skill,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Nunito',
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: isSelected
                            ? Colors.white
                            : isDisabled
                                ? const Color(0xFFBDBDBD)
                                : const Color(0xFF212121),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // CTA
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _selected.length == maxSkills && !_saving ? _confirm : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE91E63),
                    disabledBackgroundColor: const Color(0xFFE0E0E0),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: _saving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          'Confirm my skills',
                          style: TextStyle(
                            fontFamily: 'Nunito',
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SpecialismPreviewChip extends StatelessWidget {
  final Specialism specialism;
  const _SpecialismPreviewChip({required this.specialism});

  @override
  Widget build(BuildContext context) {
    final color = Color(int.parse(specialism.color.replaceFirst('#', '0xFF')));
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withOpacity(0.35)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.auto_awesome, size: 12, color: color),
              const SizedBox(width: 4),
              Text(
                'Looks like: ${specialism.title}',
                style: TextStyle(
                  fontFamily: 'Nunito',
                  fontWeight: FontWeight.w700,
                  fontSize: 11,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
