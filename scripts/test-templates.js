const fs = require('fs');
const path = require('path');

// Load task templates
const loadTaskTemplates = async (language = "en") => {
  try {
    const templatePath = path.join(__dirname, '..', 'src', 'data', 'templates', `task-templates-${language}.json`);
    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    const templates = templateData.templates || [];
    
    // Add language and is_ai_generated fields to each template
    return templates.map(template => ({
      ...template,
      language,
      is_ai_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error(`Error loading templates for language ${language}:`, error);
    return [];
  }
};

// Filter templates based on user's rooms and preferences
const filterTemplatesByUserProfile = (
  templates,
  rooms,
  lifestyle,
  cleaning_preferences,
  pets,
  children,
  allergies
) => {
  return templates.filter(template => {
    // Check if template is for a room the user has
    if (template.category && !rooms.includes(template.category)) {
      return false;
    }

    // Adjust frequency based on lifestyle
    let adjustedFrequency = template.base_frequency_days;
    
    if (lifestyle === "busy") {
      adjustedFrequency = Math.max(adjustedFrequency * 1.5, 7); // Less frequent for busy people
    } else if (lifestyle === "relaxed") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.7, 3); // More frequent for relaxed people
    }

    // Adjust frequency based on cleaning preferences
    if (cleaning_preferences === "minimal") {
      adjustedFrequency = Math.max(adjustedFrequency * 1.8, 10);
    } else if (cleaning_preferences === "thorough") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.6, 2);
    }

    // Adjust for pets (more frequent cleaning)
    if (pets && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.8, 3);
    }

    // Adjust for children (more frequent cleaning)
    if (children && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.8, 3);
    }

    // Adjust for allergies (more frequent cleaning)
    if (allergies && template.category !== "exterior") {
      adjustedFrequency = Math.max(adjustedFrequency * 0.7, 2);
    }

    // Update the template with adjusted frequency
    template.base_frequency_days = Math.round(adjustedFrequency);

    return true;
  });
};

// Test the template loading and filtering
const testTemplates = async () => {
  console.log('Loading templates...');
  const allTemplates = await loadTaskTemplates('en');
  console.log(`Loaded ${allTemplates.length} templates`);

  // Test user profile
  const userProfile = {
    rooms: ['kitchen', 'bathroom', 'bedroom', 'living_room'],
    lifestyle: 'busy',
    cleaning_preferences: 'standard',
    pets: true,
    children: false,
    allergies: false,
  };

  console.log('\nUser profile:', userProfile);

  const filteredTemplates = filterTemplatesByUserProfile(
    allTemplates,
    userProfile.rooms,
    userProfile.lifestyle,
    userProfile.cleaning_preferences,
    userProfile.pets,
    userProfile.children,
    userProfile.allergies
  );

  console.log(`\nFiltered to ${filteredTemplates.length} templates`);

  // Show some examples
  console.log('\nExample templates:');
  filteredTemplates.slice(0, 5).forEach(template => {
    console.log(`- ${template.name} (${template.category}) - Every ${template.base_frequency_days} days`);
  });

  // Count by category
  const categoryCount = {};
  filteredTemplates.forEach(template => {
    categoryCount[template.category] = (categoryCount[template.category] || 0) + 1;
  });

  console.log('\nTemplates by category:');
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`- ${category}: ${count} templates`);
  });
};

testTemplates().catch(console.error);
