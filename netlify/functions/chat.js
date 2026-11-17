exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { message, mode = "chat" } = JSON.parse(event.body || "{}");

    if (!message || !message.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key not configured in Netlify" })
      };
    }

    const prompts = {
      chat: "You are KRISHNA AI, a helpful assistant. Answer clearly.",
      study: "You are KRISHNA AI Study Mode. Teach step by step in simple language.",
      math: "You are KRISHNA AI Maths Helper. Solve maths step by step and explain.",
      notes: "Create clear, organized study notes from the user's request.",
      quiz: "Create a useful quiz with questions and answers."
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: prompts[mode] || prompts.chat }]
          },
          contents: [{
            parts: [{ text: message }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "Gemini API error"
        })
      };
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("") || "No response received.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
