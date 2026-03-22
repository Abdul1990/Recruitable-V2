import 'package:cloud_firestore/cloud_firestore.dart';

class Job {
  final String id;
  final String title;
  final String company;
  final String location;       // short code e.g. 'KL', 'SF', 'NYC'
  final String locationFull;
  final String region;         // 'US' | 'KL' | 'London'
  final String type;           // 'AI / ML' | 'Engineering' | 'Data' | 'Product'
  final String salary;
  final String salaryNote;
  final List<String> stack;
  final String description;
  final String posted;
  final String color;          // hex — matches specialism colour
  final String? badge;         // e.g. 'Hot', 'New'
  final DateTime postedAt;

  const Job({
    required this.id,
    required this.title,
    required this.company,
    required this.location,
    required this.locationFull,
    required this.region,
    required this.type,
    required this.salary,
    required this.salaryNote,
    required this.stack,
    required this.description,
    required this.posted,
    required this.color,
    this.badge,
    required this.postedAt,
  });

  factory Job.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Job(
      id: doc.id,
      title: d['title'] as String,
      company: d['company'] as String,
      location: d['location'] as String,
      locationFull: d['locationFull'] as String,
      region: d['region'] as String,
      type: d['type'] as String,
      salary: d['salary'] as String,
      salaryNote: d['salaryNote'] as String? ?? '',
      stack: List<String>.from(d['stack'] ?? []),
      description: d['description'] as String,
      posted: d['posted'] as String,
      color: d['color'] as String? ?? '#E91E63',
      badge: d['badge'] as String?,
      postedAt: d['postedAt'] != null
          ? (d['postedAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() => {
    'title': title,
    'company': company,
    'location': location,
    'locationFull': locationFull,
    'region': region,
    'type': type,
    'salary': salary,
    'salaryNote': salaryNote,
    'stack': stack,
    'description': description,
    'posted': posted,
    'color': color,
    if (badge != null) 'badge': badge,
    'postedAt': Timestamp.fromDate(postedAt),
  };
}
