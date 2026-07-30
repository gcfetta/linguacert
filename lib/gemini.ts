import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function evaluateResponse(
  userMessage: string,
  language: string,
  level: string,
  topic: string
): Promise<{ feedback: string; score: number; corrected: string }> {
  const prompt = `
Eres un profesor de ${language} evaluando a un estudiante de nivel ${level}.
El tema de conversación es: "${topic}".
El estudiante escribió: "${userMessage}"

Respondé en español con este JSON exacto (sin markdown):
{
  "feedback": "comentario constructivo sobre gramática y vocabulario",
  "score": número del 0 al 100,
  "corrected": "versión corregida del mensaje en ${language}"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function generateTopic(language: string, level: string): Promise<string> {
  const prompt = `
Generá un tema de conversación simple en español para practicar ${language} 
en nivel ${level}. Solo devolvé el tema, sin explicación. Máximo 10 palabras.
`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}