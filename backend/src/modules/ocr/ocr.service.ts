import Tesseract from "tesseract.js";

export async function extractTextFromImage(imagePath: string) {
  const result = await Tesseract.recognize(
    imagePath,
    "por+eng+fra",
    {
      logger: (m) => console.log(m),
    }
  );

  return result.data.text;
}
