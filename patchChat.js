const fs = require('fs');
const file = 'src/components/sparklin/SparklinChat.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `
        if (data.text) {
          setChatHistory(prev => [...prev, {
             id: (Date.now() + 1).toString(),
             sender: "sparklin",
             text: language === "es" ? data.text.es : data.text.en,
             uiAction: data.uiAction
          }]);
        } else {
`.trim();

const replacement = `
        if (data.text) {
          if (data.intent === "LORE") {
            const newCount = consecutiveLoreCount + 1;
            setConsecutiveLoreCount(newCount);
            
            if (newCount >= 3) {
              const spellOptions = [
                {
                   en: "I am flattered by your devotion, Hero, truly! But my magic only works if you move the brush. The Dust Dragons aren't going to banish themselves while we chat!",
                   es: "¡Me halaga tu devoción, Héroe, de verdad! Pero mi magia solo funciona si tú mueves el cepillo. ¡Los Dragones de Polvo no se van a desterrar solos mientras charlamos!"
                },
                {
                   en: "My magical energy is best spent on potions, not small talk! Go forth and conquer that kitchen; I shall be here... resting my magnificent beard.",
                   es: "¡Mi energía mágica se aprovecha mejor en pociones, no en charlas triviales! Ve y conquista esa cocina; yo estaré aquí... descansando mi magnífica barba."
                },
                {
                   en: "I know, I know, I am incredibly charismatic. But even the greatest wizards need to scrub a toilet once in a while. Off you go! Your legend awaits in the laundry room!",
                   es: "Lo sé, lo sé, soy increíblemente carismático. Pero incluso los magos más grandes necesitan fregar un inodoro de vez en cuando. ¡Largo de aquí! ¡Tu leyenda te espera en el cuarto de lavado!"
                },
                {
                   en: "Are you trying to cast a 'Procrastination Shield' by talking to me? It won't work! The Grime Goblins are throwing a party in your sink right now. To battle!",
                   es: "¿Estás intentando lanzar un 'Escudo de Procrastinación' hablando conmigo? ¡No funcionará! Los Duendes de la Mugre están dando una fiesta en tu fregadero ahora mismo. ¡A la batalla!"
                }
              ];
              const spell = spellOptions[Math.floor(Math.random() * spellOptions.length)];
              
              setChatHistory(prev => [...prev, {
                 id: (Date.now() + 1).toString(),
                 sender: "sparklin",
                 text: language === "es" ? spell.es : spell.en,
                 uiAction: data.uiAction
              }]);
              setConsecutiveLoreCount(0);
              if (contextObj) setPendingPrompt(null);
              return;
            }
          } else {
             setConsecutiveLoreCount(0);
          }

          setChatHistory(prev => [...prev, {
             id: (Date.now() + 1).toString(),
             sender: "sparklin",
             text: language === "es" ? data.text.es : data.text.en,
             uiAction: data.uiAction
          }]);
        } else {
`.trim();

// Since spaces might mismatch slightly, let's use a regex that ignores exact whitespace.
const regex = /if\s*\(data\.text\)\s*{\s*setChatHistory\(prev\s*=>\s*\[\.\.\.prev,\s*{\s*id:\s*\(Date\.now\(\)\s*\+\s*1\)\.toString\(\),\s*sender:\s*"sparklin",\s*text:\s*language\s*===\s*"es"\s*\?\s*data\.text\.es\s*:\s*data\.text\.en,\s*uiAction:\s*data\.uiAction\s*}\]\);\s*}\s*else\s*{/g;

if (!regex.test(content)) {
  console.log("Not found with regex!");
} else {
  let newContent = content.replace(regex, replacement);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log("Successfully replaced!");
}
