import Tesseract from "tesseract.js";

const OCR_LANGS = process.env.OCR_LANGS || "por+eng";

export async function extractTextFromImage(imagePath: string) {
  const result = await Tesseract.recognize(
    imagePath,
    OCR_LANGS,
    {
      logger: (m) => console.log(m),
    }
  );

  return result.data.text;
}
