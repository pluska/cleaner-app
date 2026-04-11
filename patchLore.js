const fs = require('fs');
const file = 'src/app/api/sparklin/chat/route.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /const userPrompt = `The user said: "\$\{message\}". Respond as Sparklin. Return ONLY the JSON.`;\s+const model = genAI.getGenerativeModel\(\{ model: "gemini-1\.5-flash", systemInstruction: SPARKLIN_SYSTEM_PROMPT \}\);\s+const result = await model.generateContent\(userPrompt\);/g;

const replacement = `const userPrompt = \`The user said: "\${message}". Respond as Sparklin. Return ONLY the JSON.\`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SPARKLIN_SYSTEM_PROMPT });
    
    try {
      const result = await model.generateContent(userPrompt);`;

let newContent = content.replace(regex, replacement);

const regex2 = /           }\n       }\);\n    }\n/g;
if (newContent.includes('try {\n      const result = await model.generateContent')) {
   // append the catch block to close the new try
   newContent = newContent.replace(/           }\n       }\);\n    }/g, `           }\n       });\n    }\n    } catch (apiError) {\n      console.error("Gemini API Error in LORE:", apiError);\n      return NextResponse.json({\n        intent: "LORE",\n        text: {\n          en: "Forgive me, Hero! My crystal ball is cloudy. Please try again or ask me about cleaning quests.",\n          es: "¡Perdóname, Héroe! Mi bola de cristal mágica está nublada. Inténtalo de nuevo o pregúntame sobre limpieza."\n        }\n      });\n    }`);
   
   fs.writeFileSync(file, newContent, 'utf8');
   console.log("Patched successfully via node!");
} else {
   console.log("Regex 1 failed");
}
