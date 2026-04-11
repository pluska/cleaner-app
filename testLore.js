const { GoogleGenerativeAI } = require("@google/generative-ai");

(async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.log("NO API KEY IN ENV"); return; }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    const result = await model.generateContent("Respond with JSON { \"en\": \"hello\", \"es\": \"hola\" }");
    console.log(result.response.text());
  } catch (e) {
    console.log("Error:", e);
  }
})();
