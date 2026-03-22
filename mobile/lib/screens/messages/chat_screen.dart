import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../models/interview.dart';
import '../../models/match.dart';
import '../../models/message.dart';
import '../../services/auth_service.dart';
import '../../services/firestore_service.dart';
import '../../services/interview_service.dart';
import '../interviews/book_interview_screen.dart';
import '../interviews/interview_card.dart';

class ChatScreen extends StatefulWidget {
  final Match match;

  const ChatScreen({super.key, required this.match});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final _uuid = const Uuid();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    FirestoreService.instance.markMessagesRead(widget.match.id);
  }

  Future<void> _send() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _sending) return;

    final uid = AuthService.instance.currentUser?.uid;
    if (uid == null) return;

    setState(() => _sending = true);
    _textController.clear();

    await FirestoreService.instance.sendMessage(Message(
      id: _uuid.v4(),
      matchId: widget.match.id,
      senderId: uid,
      text: text,
      sentAt: DateTime.now(),
    ));

    setState(() => _sending = false);

    // Scroll to bottom after sending
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.instance.currentUser?.uid ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF212121)),
          onPressed: () => context.go('/matches'),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.match.company,
              style: const TextStyle(
                fontFamily: 'Nunito', fontWeight: FontWeight.w800,
                fontSize: 16, color: Color(0xFF212121),
              ),
            ),
            Text(
              widget.match.jobTitle,
              style: const TextStyle(
                fontFamily: 'Nunito', fontWeight: FontWeight.w600,
                fontSize: 12, color: Color(0xFF8A8A9E),
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFE3F2FD),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '${widget.match.matchScore}% match',
              style: const TextStyle(
                fontFamily: 'Nunito', fontWeight: FontWeight.w700,
                fontSize: 11, color: Color(0xFF03A9F4),
              ),
            ),
          ),
          // Book interview button — visible to recruiter side
          IconButton(
            icon: const Icon(Icons.event_available_outlined, color: Color(0xFFE91E63)),
            tooltip: 'Book interview',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => BookInterviewScreen(match: widget.match),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Interview card — shown at the top of the chat when one exists
          StreamBuilder<Interview?>(
            stream: InterviewService.instance.watchMatchInterview(widget.match.id),
            builder: (context, snapshot) {
              final interview = snapshot.data;
              if (interview == null) return const SizedBox.shrink();
              return InterviewCard(interview: interview);
            },
          ),

          // Chat list
          Expanded(
            child: StreamBuilder<List<Message>>(
              stream: FirestoreService.instance.watchMessages(widget.match.id),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFFE91E63)));
                }
                final messages = snapshot.data ?? [];
                if (messages.isEmpty) {
                  return const _EmptyChat();
                }
                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  itemCount: messages.length,
                  itemBuilder: (context, i) {
                    final msg = messages[i];
                    final isMe = msg.senderId == uid;
                    final showDate = i == 0 ||
                        messages[i].sentAt.day != messages[i - 1].sentAt.day;
                    return Column(
                      children: [
                        if (showDate) _DateDivider(date: msg.sentAt),
                        _MessageBubble(message: msg, isMe: isMe),
                      ],
                    );
                  },
                );
              },
            ),
          ),

          // Input bar
          Container(
            color: Colors.white,
            padding: EdgeInsets.fromLTRB(
              16, 12, 16, MediaQuery.of(context).viewInsets.bottom + 12,
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    textCapitalization: TextCapitalization.sentences,
                    maxLines: 4,
                    minLines: 1,
                    decoration: InputDecoration(
                      hintText: 'Message ${widget.match.company}...',
                      hintStyle: const TextStyle(
                        fontFamily: 'Nunito', color: Color(0xFFBDBDBD), fontSize: 14,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF4F6FB),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: _send,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: Color(0xFFE91E63),
                      shape: BoxShape.circle,
                    ),
                    child: _sending
                        ? const Center(child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)))
                        : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}

class _MessageBubble extends StatelessWidget {
  final Message message;
  final bool isMe;

  const _MessageBubble({required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFFE91E63) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isMe ? 18 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 18),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          message.text,
          style: TextStyle(
            fontFamily: 'Nunito',
            fontWeight: FontWeight.w500,
            fontSize: 14,
            color: isMe ? Colors.white : const Color(0xFF212121),
            height: 1.4,
          ),
        ),
      ),
    );
  }
}

class _DateDivider extends StatelessWidget {
  final DateTime date;
  const _DateDivider({required this.date});

  String _label() {
    final now = DateTime.now();
    final diff = now.difference(date).inDays;
    if (diff == 0) return 'Today';
    if (diff == 1) return 'Yesterday';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          const Expanded(child: Divider(color: Color(0xFFE0E0E0))),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(
              _label(),
              style: const TextStyle(fontFamily: 'Nunito', fontSize: 11, color: Color(0xFF8A8A9E)),
            ),
          ),
          const Expanded(child: Divider(color: Color(0xFFE0E0E0))),
        ],
      ),
    );
  }
}

class _EmptyChat extends StatelessWidget {
  const _EmptyChat();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.chat_bubble_outline, size: 48, color: Color(0xFFE0E0E0)),
          SizedBox(height: 12),
          Text(
            "You matched! Break the ice.",
            style: TextStyle(fontFamily: 'Nunito', fontWeight: FontWeight.w700, fontSize: 16, color: Color(0xFF8A8A9E)),
          ),
        ],
      ),
    );
  }
}
