import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class CvService {
  CvService._();
  static final CvService instance = CvService._();

  /// Lets the user pick a PDF or DOCX file.
  Future<PlatformFile?> pickCv() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'docx'],
      withData: true,
    );
    return result?.files.firstOrNull;
  }

  /// Uploads the CV file to the backend, which:
  ///   1. Renders page 1 as a PNG image
  ///   2. Runs PII scrubbing (removes phone numbers and email addresses)
  ///   3. Returns a Firebase Storage URL for the cleaned image
  ///
  /// The raw CV file is never stored — only the sanitised image.
  Future<String?> uploadCvAndGetImageUrl({
    required String uid,
    required PlatformFile file,
  }) async {
    if (file.bytes == null) return null;

    final res = await http.post(
      Uri.parse(AppConfig.cvUploadEndpoint),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'uid': uid,
        'fileName': file.name,
        'fileData': base64Encode(file.bytes!),
        'fileType': file.extension?.toLowerCase() ?? 'pdf',
      }),
    );

    if (res.statusCode != 200) return null;
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['cvImageURL'] as String?;
  }

  /// Downloads the CV image bytes from Firebase Storage for display.
  Future<Uint8List?> downloadCvImage(String cvImageURL) async {
    try {
      final ref = FirebaseStorage.instance.refFromURL(cvImageURL);
      return await ref.getData(5 * 1024 * 1024); // 5 MB max
    } catch (_) {
      return null;
    }
  }

  /// Deletes the CV image from Firebase Storage (e.g., user removes their CV).
  Future<void> deleteCvImage(String cvImageURL) async {
    try {
      final ref = FirebaseStorage.instance.refFromURL(cvImageURL);
      await ref.delete();
    } catch (_) {
      // Silently ignore if already deleted
    }
  }
}
