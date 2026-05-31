import dotenv from "dotenv";

dotenv.config();

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    if (process.env.GROQ_API_KEY) {
      let model = "mixtral-8x7b-32768"; // default fallback

      const knownChatModels = [
        "llama-3.3-70b-versatile",
        "llama-3.1-70b-versatile",
        "llama-3.2-90b-vision-preview",
        "mixtral-8x7b-32768",
        "allam-2-7b",
      ];

      // Try known models first
      for (const m of knownChatModels) {
        const testResp = await fetch(
          `https://api.groq.com/openai/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: m,
              messages: [{ role: "user", content: "test" }],
              max_tokens: 10,
            }),
          },
        );

        if (testResp.ok) {
          model = m;
          console.log("Using Groq model:", model);
          break;
        }
      }

      const url = `https://api.groq.com/openai/v1/chat/completions`;
      const gResp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: message }],
          max_tokens: 600,
        }),
      });

      const gData = await gResp.json();
      if (!gResp.ok) {
        console.error("Groq API returned error:", gResp.status, gData);
        return res.status(gResp.status).json({ error: gData });
      }

      const reply = gData?.choices?.[0]?.message?.content || "";
      return res.json({ reply, raw: gData });
    }

    if (process.env.OPENAI_API_KEY) {
      const url = `https://api.openai.com/v1/chat/completions`;
      const oResp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
          max_tokens: 600,
        }),
      });

      const oData = await oResp.json();
      if (!oResp.ok) {
        console.error("OpenAI returned error:", oResp.status, oData);
        return res.status(oResp.status).json({ error: oData });
      }

      const reply = oData?.choices?.[0]?.message?.content || "";
      return res.json({ reply, raw: oData });
    }

    // Fallback to Google Generative AI (Gemini) if OPENAI_API_KEY is not set
    if (process.env.GOOGLE_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;
      const gResp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      });

      const gData = await gResp.json();
      if (!gResp.ok) {
        console.error(
          "Google Generative API returned error:",
          gResp.status,
          gData,
        );
        return res.status(gResp.status).json({ error: gData });
      }

      const reply =
        gData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response generated";
      return res.json({ reply, raw: gData });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({
          error:
            "No AI provider configured (set GOOGLE_API_KEY or OPENAI_API_KEY)",
        });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        max_tokens: 600,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI returned error:", response.status, data);
      return res.status(response.status).json({ error: data });
    }

    const reply = data?.choices?.[0]?.message?.content || "";
    res.json({ reply, raw: data });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: err.message });
  }
};
