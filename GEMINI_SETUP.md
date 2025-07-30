# 🤖 Gemini AI Setup Guide

## Prerequisites

1. **Google AI Studio Account**: Sign up at [Google AI Studio](https://aistudio.google.com/)
2. **API Key**: Generate a Gemini API key from the Google AI Studio console

## Environment Configuration

### 1. Create Environment File

Create a `.env.local` file in the root directory:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click on "Get API key" in the top right
3. Create a new API key or use an existing one
4. Copy the API key and paste it in your `.env.local` file

### 3. API Key Format

Your API key should look like this:

```
AIzaSyC...your_actual_key_here...XYZ
```

## Testing the Integration

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Test the AI Assistant**:
   - Go to the dashboard
   - Click the "AI Assistant" button
   - Complete the home assessment
   - Verify that Gemini generates personalized recommendations

## Features

### 🤖 **AI-Powered Recommendations**

- Personalized cleaning tasks based on home assessment
- Scientific sources and health impact explanations
- Frequency adaptation based on lifestyle
- Bilingual support (English/Spanish)

### 📚 **Educational Content**

- Evidence-based explanations
- CDC, EPA, WHO guidelines
- Health impact descriptions
- User-friendly language

### 🎯 **Personalization**

- Home type adaptation (apartment, house, studio)
- Lifestyle consideration (busy, moderate, relaxed)
- Cleaning preference adjustment (minimal, standard, thorough)
- Special considerations (pets, children, allergies)

## Troubleshooting

### Common Issues

1. **API Key Not Found**

   - Ensure `.env.local` is in the root directory
   - Restart the development server after adding the key
   - Check that the key is properly formatted

2. **Gemini API Errors**

   - Verify your API key is valid
   - Check your Google AI Studio account status
   - Ensure you have sufficient quota

3. **Fallback Behavior**
   - If Gemini fails, the system falls back to mock recommendations
   - Check browser console for error messages
   - Verify network connectivity

### Error Messages

- `"Failed to parse JSON response from Gemini"`: The AI response wasn't in the expected format
- `"Gemini API Error"`: Network or authentication issue with the API
- `"No session token available"`: User authentication issue

## Security Notes

- Never commit your API key to version control
- Use environment variables for all sensitive data
- Monitor your API usage in Google AI Studio
- Consider rate limiting for production use

## Production Deployment

For production deployment:

1. **Environment Variables**: Set `GEMINI_API_KEY` in your hosting platform
2. **Rate Limiting**: Implement proper rate limiting
3. **Error Handling**: Ensure graceful fallbacks
4. **Monitoring**: Set up API usage monitoring

## Support

- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api/gemini-api)
- [Google AI Studio Console](https://aistudio.google.com/)
