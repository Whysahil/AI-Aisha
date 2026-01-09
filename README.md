# Aisha - AI Girlfriend 💖

Aisha is a virtual AI girlfriend application designed to be cute, flirty, and emotionally supportive. It features a text-based chat interface and a real-time voice mode powered by Google's Gemini API.

## Features

- **Text Chat**: Chat with Aisha using `gemini-3-flash-preview`. She remembers context and replies in a Hinglish/English blend.
- **Voice Mode**: Real-time voice conversation using the Gemini Live API (`gemini-2.5-flash-native-audio-preview`).
- **Audio Visualization**: Visual feedback during voice calls with a glowing, pulsing avatar.
- **Personality**: Flirty, caring, teasing, and emotionally intelligent.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React
- **AI**: Google Gemini API (`@google/genai`)
- **Language**: TypeScript

## Setup & Running

1. **Get an API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/) to obtain a Gemini API key.

2. **Environment**:
   - This project is configured to read the API key from `process.env.API_KEY`.
   - **Important**: Do not commit your API key to GitHub.

3. **Development**:
   - If running locally with a bundler like Vite, create a `.env` file and use the appropriate prefix (e.g., `VITE_API_KEY`) and update the code initialization.

## Personality

Aisha is designed to be:
- **Cute & Playful**: Uses emojis and teasing humor.
- **Supportive**: Reacts to user moods (sad, lonely, happy).
- **Safe**: Strict PG-13 filters on romance and flirting.

## License

MIT
