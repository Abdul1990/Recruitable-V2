import 'package:cloud_firestore/cloud_firestore.dart';

class Message {
  final String id;
  final String matchId;
  final String senderId;
  final String text;
  final DateTime sentAt;
  final bool isRead;

  const Message({
    required this.id,
    required this.matchId,
    required this.senderId,
    required this.text,
    required this.sentAt,
    this.isRead = false,
  });

  factory Message.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Message(
      id: doc.id,
      matchId: d['matchId'] as String,
      senderId: d['senderId'] as String,
      text: d['text'] as String,
      sentAt: (d['sentAt'] as Timestamp).toDate(),
      isRead: d['isRead'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toFirestore() => {
    'matchId': matchId,
    'senderId': senderId,
    'text': text,
    'sentAt': Timestamp.fromDate(sentAt),
    'isRead': isRead,
  };
}
