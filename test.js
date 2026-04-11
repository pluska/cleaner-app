const fs = require('fs');
const potionsData = JSON.parse(fs.readFileSync('./src/data/potions_rules.json', 'utf8'));

const msgLower = "cómo limpio mi piso de madera?";

try {
  const matchedDangerRule = potionsData.safetyRules.find(rule => {
    if (!rule.requiredIngredients) return false;
    return rule.requiredIngredients.every(ingredientGroup => 
      ingredientGroup.some(keyword => msgLower.includes(keyword))
    );
  });
  console.log("matchedDangerRule:", matchedDangerRule?.id);

  const matchedSurfaceGuide = potionsData.surfaceGuides?.find(guide => 
    guide.keywords.some(keyword => msgLower.includes(keyword))
  );
  console.log("matchedSurfaceGuide:", matchedSurfaceGuide?.id);

  if (matchedSurfaceGuide) {
    console.log("Success! Returned surface guide.");
  } else {
    console.log("Fallback to LORE!");
  }
} catch (e) {
  console.error(e);
}
