import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "Inglés";
  const level = searchParams.get("level") || "Intermedio";
  
  const seed = Date.now() + Math.floor(Math.random() * 1000);

  try {
    const prompt = `Actúa como un profesor de idiomas nativo. Genera un tema de conversación dinámico, interesante y adecuado para un nivel ${level} en el idioma ${language}.
    
    Identificador único de aleatoriedad: ${seed}.
    
    INSTRUCCIÓN DE CATEGORÍA:
    Elige obligatoriamente UN tema al azar inspirado en uno de los siguientes elementos de esta lista: ["Planes de viaje", "Cine y series favoritas", "Pasatiempos de fin de semana", "Gastronomía típica", "Libros y tecnología del celular"].

    REGLAS ESTRICTAS DE FORMATO:
    1. NO elijas temas de animales, mascotas ni rutinas aburridas. Tampoco elijas cosas raras como comida del futuro o insectos. Busca un punto medio cotidiano y entretenido.
    2. Las propiedades "topic" y "topicEs" deben ser títulos extremadamente cortos (máximo 3 palabras).
    3. Responde ÚNICAMENTE con el objeto JSON plano. Está prohibido agregar texto antes o después de las llaves, y NO uses marcas markdown como \`\`\`json.

    Estructura exacta del JSON requerido:
    {
      "topic": "Título corto en ${language}",
      "topicEs": "Traducción exacta al español",
      "intro": "Tu saludo real de bienvenida como profesor en el idioma ${language} introduciendo el tema con entusiasmo y haciendo una pregunta abierta natural para iniciar la charla."
    }`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "LinguaCert"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "Error en OpenRouter");

    const text = data.choices[0].message.content.trim();
    
    // Limpieza extrema por si el modelo devuelve marcas de bloque de código
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Validamos que sea un JSON ejecutable antes de enviarlo al frontend
    const parsedData = JSON.parse(cleanText);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Error capturado en el backend:", error);
    
    // Contingencia inteligente en tiempo de ejecución para que el front NUNCA reciba un HTML roto
    const safeFallbacks: Record<string, {topic: string, topicEs: string, intro: string}> = {
      "Inglés": {
        topic: "Travel Dreams",
        topicEs: "Viajes Soñados",
        intro: "Hello! Let's talk about our dream vacations. If you could travel anywhere right now, what country would you choose and why?"
      },
      "Francés": {
        topic: "Les Vacances",
        topicEs: "Las Vacaciones",
        intro: "Bonjour! Parlons de vos vacances de rêve. Si vous pouviez voyager n'importe où maintenant, quel pays choisiriez-vous?"
      },
      "Portugués": {
        topic: "Planos de Viagem",
        topicEs: "Planes de Viaje",
        intro: "Olá! Vamos falar sobre as suas férias dos sonhos. Se você pudesse viajar para qualquer lugar agora, qual país escolheria?"
      },
      "Italiano": {
        topic: "Viaggi da Sogno",
        topicEs: "Viajes de Ensueño",
        intro: "Ciao! Parliamo delle tue vacanze da sogno. Se potessi viaggiare ovunque adesso, quale paese sceglieresti?"
      },
      "Alemán": {
        topic: "Traumreisen",
        topicEs: "Viajes de Ensueño",
        intro: "Hallo! Lassen Sie uns über Ihre Traumreisen sprechen. Wenn Sie jetzt irgendwohin reisen könnten, welches Land würden Sie wählen?"
      }
    };

    const fallback = safeFallbacks[language] || safeFallbacks["Inglés"];
    return NextResponse.json(fallback);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, language, level, topic } = body;

    const prompt = `Actúas como un profesor de idiomas nativo, super carismático y conversador experto en ${language}. El usuario posee un nivel ${level} y debaten sobre el tema: "${topic}".
    Analiza de forma personalizada y evalúa este mensaje actual del alumno: "${userMessage}".
    
    Debes responder ÚNICAMENTE con un objeto JSON plano, sin marcas markdown:
    {
      "feedback": "Explicación detallada y constructiva en ESPAÑOL de los errores gramaticales o puntos fuertes de SU mensaje actual.",
      "score": un número entero de 1 a 100 basado estrictamente en este mensaje específico,
      "corrected": "La frase exacta que escribió el alumno, corregida de forma nativa y perfecta en el idioma ${language}.",
      "reply": "Tu opinión fluida en el idioma ${language} sobre lo que dijo el alumno seguido de una pregunta abierta para obligarlo a seguir hablando."
    }`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "LinguaCert"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "Error en OpenRouter");

    const text = data.choices[0].message.content.trim();
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      feedback: "Buen intento. Tu estructura se entiende bien de manera general.",
      score: 80,
      corrected: userMessage,
      reply: "Tell me more about your ideas!"
    });
  }
}