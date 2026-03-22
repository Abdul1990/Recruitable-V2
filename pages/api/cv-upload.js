// POST /api/cv-upload
// Accepts a base64-encoded PDF or DOCX file.
// Renders page 1 as a PNG image, strips PII, uploads to Firebase Storage,
// and returns the public image URL.
//
// Required env vars:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY,
//   FIREBASE_STORAGE_BUCKET

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { createCanvas } from 'canvas'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js'
import { v4 as uuidv4 } from 'uuid'

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]{2,}/g
const PHONE_RE = /(\+?[\d][\d\s\-().]{6,}[\d])/g

function getAdminStorage() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  }
  return getStorage().bucket()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { uid, fileName, fileData, fileType } = req.body

  if (!uid || !fileData || !fileType) {
    return res.status(400).json({ error: 'uid, fileData, and fileType are required' })
  }

  if (!['pdf', 'docx'].includes(fileType)) {
    return res.status(400).json({ error: 'Only PDF and DOCX files are supported' })
  }

  const fileBuffer = Buffer.from(fileData, 'base64')
  if (fileBuffer.length > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'File exceeds 10 MB limit' })
  }

  try {
    let pngBuffer

    if (fileType === 'pdf') {
      pngBuffer = await renderPdfPage1ToPng(fileBuffer)
    } else {
      // DOCX: convert to PDF server-side then render
      // For now return a placeholder — full DOCX→PDF requires LibreOffice or similar
      // TODO: integrate a DOCX→PDF conversion service (e.g. Gotenberg or LibreOffice)
      return res.status(200).json({
        cvImageURL: null,
        message: 'DOCX rendering coming soon. Please upload a PDF.',
      })
    }

    // Scrub PII from the rendered PNG by re-rendering with redacted text boxes
    // Note: pixel-level PII removal is done via the pdfjs text layer above.
    // For now we rely on pdfjs NOT rendering invisible text — visual PII
    // (printed in the document) requires an OCR + redact step (Phase 2 enhancement).

    // Upload to Firebase Storage
    const bucket = getAdminStorage()
    const storagePath = `cv-images/${uid}/${uuidv4()}.png`
    const file = bucket.file(storagePath)

    await file.save(pngBuffer, {
      metadata: { contentType: 'image/png' },
      public: true,
    })

    const cvImageURL = file.publicUrl()

    console.log(`[cv-upload] Uploaded CV image for ${uid}: ${storagePath}`)
    return res.status(200).json({ cvImageURL })
  } catch (err) {
    console.error('[cv-upload] Error:', err)
    return res.status(500).json({ error: 'CV processing failed' })
  }
}

// ─── PDF → PNG (page 1) ───────────────────────────────────────────────────────

async function renderPdfPage1ToPng(pdfBuffer) {
  const pdf = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale: 2.0 }) // 2x for clarity
  const canvas = createCanvas(viewport.width, viewport.height)
  const ctx = canvas.getContext('2d')

  // Render the PDF page to canvas
  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise

  // Redact text layer: overlay white boxes over emails and phone numbers
  // by inspecting the text layer content
  const textContent = await page.getTextContent()
  for (const item of textContent.items) {
    const text = item.str ?? ''
    const hasPii = EMAIL_RE.test(text) || PHONE_RE.test(text)
    // Reset regex lastIndex after test()
    EMAIL_RE.lastIndex = 0
    PHONE_RE.lastIndex = 0

    if (hasPii) {
      // Redact the bounding box with a white rectangle
      const tx = item.transform
      // tx is a [a, b, c, d, e, f] affine matrix from PDF coordinates
      const x = tx[4]
      const y = viewport.height - tx[5] - (item.height ?? 12) * 2
      const w = item.width ?? 80
      const h = (item.height ?? 12) * 2.2

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(x, y, w, h)
    }
  }

  return canvas.toBuffer('image/png')
}
