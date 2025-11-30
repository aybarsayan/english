# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIB Portal ("Kai") is an English learning application for elementary school students (ages 6-12) at Kariyer Koleji, Ankara. It features an AI mascot named "Kai" that helps children practice English through voice conversations, stories, vocabulary, quizzes, and games.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: OpenAI API (GPT-4o-mini for chat, GPT-4o-realtime for voice, DALL-E 3 for images)
- **Package Manager**: pnpm

## Architecture

### App Router Structure
- `app/page.tsx` - Home page with real-time voice conversation (main feature)
- `app/chat/` - Text-based chat with Kai
- `app/story/` - AI-generated stories
- `app/vocabulary/` - Vocabulary learning cards
- `app/quiz/` - Multiple choice quizzes
- `app/games/` - Word games
- `app/talk/` - Alternative voice page

### API Routes (`app/api/`)
- `chat/route.ts` - Text chat completions
- `realtime/session/route.ts` - Creates OpenAI Realtime API sessions with ephemeral keys
- `story/route.ts` - Story generation
- `vocabulary/route.ts` - Vocabulary word generation
- `quiz/route.ts` - Quiz question generation
- `tts/route.ts` - Text-to-speech
- `transcribe/route.ts` - Speech-to-text
- `image/route.ts` - DALL-E image generation

### Core Libraries (`lib/`)
- `openai.ts` - OpenAI client setup, chat completion, JSON completion, and image generation functions
- `prompts.ts` - System prompts for Kai's persona and each mode (chat, story, vocabulary, quiz, game)
- `useRealtimeVoice.ts` - React hook for WebRTC-based real-time voice conversations with OpenAI
- `useVoice.ts` - Alternative voice hook using TTS/transcription APIs

### Components
- `Mascot.tsx` - Animated Kai mascot with multiple moods/animations (wave, jump, dance, etc.)
- `ChatInterface.tsx` - Text chat UI component
- `VocabularyCard.tsx` - Flashcard-style vocabulary display
- `QuizCard.tsx` - Quiz question UI
- `StoryDisplay.tsx` - Story reading view
- `Navbar.tsx` - Navigation bar

## Key Implementation Details

### Real-time Voice (Main Feature)
The home page uses OpenAI's Realtime API via WebRTC for natural voice conversations:
1. Server creates an ephemeral session via `/api/realtime/session`
2. Client establishes WebRTC peer connection with microphone input
3. Server VAD (Voice Activity Detection) handles turn-taking automatically
4. AI can trigger mascot animations via function calling (`trigger_animation` tool)

### AI Persona
Kai is configured to:
- Use simple English appropriate for young learners
- Respond with short sentences (1-4 sentences)
- Gently correct mistakes without criticism
- Trigger animations to make interactions engaging
- Follow strict safety rules for child-appropriate content

### Path Aliases
`@/*` maps to the project root (configured in tsconfig.json)

## Environment Variables

Required: `OPENAI_API_KEY`
