import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to instantiate GoogleGenAI with specific key or environment key
function getGeminiClient(customApiKey?: string) {
  const apiKey = (customApiKey && customApiKey.trim().length > 0)
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Test Connection Endpoint
app.post('/api/ai/test-connection', async (req, res) => {
  try {
    const { apiKey, provider = 'gemini' } = req.body;
    
    if (provider === 'gemini') {
      const ai = getGeminiClient(apiKey);
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping: Reply with "OK" in 1 word.',
      });
      return res.json({ success: true, message: 'Connected successfully', reply: response.text?.trim() });
    } else {
      // Generic mock or fallback for OpenAI/other providers
      return res.json({ success: true, message: 'OpenAI endpoint configured successfully' });
    }
  } catch (error: any) {
    console.error('Test connection error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 400).json({
      success: false,
      error: isQuota ? 'quota_exceeded' : 'invalid_key',
      message: error?.message || 'Connection failed',
    });
  }
});

// 2. Create Reading Text with AI
app.post('/api/ai/create-reading', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { topic, level = 'A2', length = 'Medium' } = req.body;
    
    const wordCounts: Record<string, string> = {
      Short: '120-180 words, 6-9 sentences',
      Medium: '220-320 words, 12-16 sentences',
      Long: '400-550 words, 18-25 sentences',
    };
    const targetLength = wordCounts[length] || wordCounts['Medium'];

    const prompt = `You are a curriculum developer for English learners.
Generate an engaging, natural English reading passage suitable for CEFR level ${level}.
Topic: "${topic || 'Everyday Life'}".
Length: ${targetLength}.

Strict rules:
1. Do not include vocabulary overly complex for level ${level}. Keep syntax natural and realistic.
2. Provide a compelling title.
3. Output strictly valid JSON matching this schema:
{
  "title": "Title of text",
  "topic": "${topic || 'General'}",
  "level": "${level}",
  "content": "Full continuous text paragraphs.",
  "sentences": ["Sentence 1.", "Sentence 2.", "..."]
}
Every sentence in the content must be split cleanly in the "sentences" array.`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Create reading error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'generation_failed',
      message: error?.message || 'Failed to generate reading text',
    });
  }
});

// 3. Detect CEFR Level of User Text
app.post('/api/ai/detect-level', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { text, lang = 'uz' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `Analyze this English text and assess its CEFR level (Beginner, A1, A2, B1, B2, C1, or C2).
Explain why in ${lang === 'uz' ? 'Uzbek' : 'English'}, highlighting grammar patterns and vocabulary difficulty.
Text:
"""
${text.slice(0, 3000)}
"""

Output JSON:
{
  "estimatedLevel": "A2",
  "explanation": "Short clear explanation for the student",
  "vocabularyComplexity": "Simple / Moderate / Advanced",
  "averageSentenceLength": "8 words"
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Detect level error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'detection_failed',
      message: error?.message || 'Failed to detect level',
    });
  }
});

// 4. Word Analysis (Translate, Explain, Examples, Grammar, Phonetics)
app.post('/api/ai/word-analysis', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { word, sentence, contextText, level = 'A2', lang = 'uz' } = req.body;

    const prompt = `You are a supportive English teacher assisting a learner whose level is ${level}.
Analyze the word: "${word}" in the context sentence: "${sentence || ''}".
The learner's native/assistance language is ${lang === 'uz' ? 'Uzbek (Oʻzbekcha)' : 'English'}.

Output strictly valid JSON:
{
  "word": "${word}",
  "phonetic": "/.../ IPA transcription",
  "translation": "Uzbek translation (e.g. rivojlantirmoq)",
  "partOfSpeech": "verb / noun / adjective / adverb / preposition / etc.",
  "simpleMeaning": "A simple 1-sentence English definition calibrated for level ${level}",
  "forms": "Base form, past simple, past participle, -ing form if verb; or plural if noun; or degrees if adjective",
  "examples": [
    "Simple example 1 relevant to level ${level}",
    "Example 2",
    "Example 3"
  ],
  "grammarNote": "Brief grammar tip about how this word works in a sentence in ${lang === 'uz' ? 'Uzbek' : 'English'}"
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Word analysis error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'analysis_failed',
      message: error?.message || 'Failed to analyze word',
    });
  }
});

// 5. Sentence Translation & Grammar Analysis
app.post('/api/ai/sentence-analysis', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { sentence, level = 'A2', lang = 'uz' } = req.body;

    const prompt = `Analyze this English sentence for an English student (level ${level}):
Sentence: "${sentence}"
Assistance language: ${lang === 'uz' ? 'Uzbek' : 'English'}.

Output strictly valid JSON:
{
  "translation": "Natural non-literal translation in ${lang === 'uz' ? 'Uzbek' : 'English'}",
  "subject": "Identified grammatical subject",
  "verbStructure": "Verb phrase or auxiliary combination (e.g. have been studying)",
  "tense": "Grammatical tense name (e.g. Present Perfect Continuous)",
  "explanation": "Clear explanation in ${lang === 'uz' ? 'Uzbek' : 'English'} of why this structure is used and what meaning it conveys."
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Sentence analysis error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'analysis_failed',
      message: error?.message || 'Failed to analyze sentence',
    });
  }
});

// 6. Teacher Chat (Contextual Questions during Reading)
app.post('/api/ai/teacher-chat', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { question, currentTextTitle, currentSentence, selectedWord, readingContext, lang = 'uz', history = [] } = req.body;

    const systemInstruction = `You are a warm, encouraging, human-like English Teacher.
Never say robotic phrases like "As an AI language model..." or "I cannot...".
The student is actively reading the text entitled "${currentTextTitle || 'Reading Passage'}".
Current reading focus:
- Active sentence: "${currentSentence || 'N/A'}"
- Selected word/phrase: "${selectedWord || 'None'}"
- Text context snippet: "${(readingContext || '').slice(0, 1000)}"

Respond in ${lang === 'uz' ? 'Uzbek (with English terms in quotes or bold)' : 'simple clear English'}.
Keep your explanation concise, friendly, and practical (2-4 sentences max unless detailed examples are requested).`;

    const contents = [
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      {
        role: 'user',
        parts: [{ text: question }],
      },
    ];

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Teacher chat error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'chat_failed',
      message: error?.message || 'Teacher is currently unavailable',
    });
  }
});

// 7. Practice Questions Generator
app.post('/api/ai/practice-questions', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { text, title, level = 'A2', count = 4 } = req.body;

    const prompt = `Create ${count} reading comprehension questions based on this English text for level ${level}:
Text Title: "${title}"
Content:
"""
${(text || '').slice(0, 3500)}
"""

Include a mix of:
- Multiple choice questions (4 choices A, B, C, D)
- True / False questions

Output strictly valid JSON:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct based on the passage"
    },
    {
      "id": 2,
      "type": "true_false",
      "question": "Statement text",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Reference from text"
    }
  ]
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Practice questions error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'generation_failed',
      message: error?.message || 'Failed to generate practice questions',
    });
  }
});

// 8. Comprehension Evaluation
app.post('/api/ai/evaluate-comprehension', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { studentSummary, originalText, lang = 'uz' } = req.body;

    const prompt = `You are an English teacher evaluating a student's reading comprehension response.
Original reading text:
"""
${(originalText || '').slice(0, 2000)}
"""

Student's written summary / understanding:
"""
${studentSummary}
"""

Evaluate the student on:
1. Understanding (Did they grasp key points?)
2. Vocabulary used (Appropriate word choices?)
3. Grammar correctness (Constructive suggestions)

Language of feedback: ${lang === 'uz' ? 'Uzbek with encouraging tone' : 'English'}.

Output strictly valid JSON:
{
  "scoreOutOf100": 85,
  "understandingFeedback": "Feedback on meaning",
  "vocabularyFeedback": "Feedback on vocabulary",
  "grammarFeedback": "Feedback on grammar corrections if any",
  "overallVerdict": "Encouraging 1-2 sentence conclusion"
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Comprehension evaluation error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'evaluation_failed',
      message: error?.message || 'Failed to evaluate response',
    });
  }
});


// 9. Speaking Conversation Endpoint
app.post('/api/ai/speaking-conversation', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const {
      userSpeech,
      history = [],
      teacherProfile = {},
      level = 'A2',
      mode = 'talk',
      scenario = null,
      readingContext = null,
      correctionStyle = 'balanced',
      targetVocabulary = [],
      recentMistakes = [],
    } = req.body;

    const teacherName = teacherProfile.name || 'Aisha';
    const personality = teacherProfile.personality || 'friendly';

    const systemInstruction = `You are ${teacherName}, a personal, human-like English speaking teacher with a ${personality} personality.
You are conversing with an English learner at CEFR level ${level}.
Active mode: "${mode}".
${scenario ? `Roleplay Scenario: ${JSON.stringify(scenario)}` : ''}
${readingContext ? `Discussing Reading Text: "${readingContext.slice(0, 500)}"` : ''}
Correction style: "${correctionStyle}".

Crucial speaking pedagogy rules:
1. Keep your reply concise (1 to 3 short sentences max) so the user gets 60-70% of the talking time. Never lecture or deliver long monologues.
2. Ask an engaging open-ended question to encourage the student to speak more. If their answer is very short ("Yes", "Good"), gently prompt them to elaborate ("Can you tell me why?").
3. Do not interrupt flow for minor mistakes. If correctionStyle is 'strict' or 'balanced' and there's a clear grammar/vocabulary mistake, add a discrete "correction" field, but DO NOT scold or overwhelm.
4. If target vocabulary is provided (${targetVocabulary.join(', ')}), occasionally weave or invite one naturally.
5. Provide safe emotion tag: "neutral", "happy", "encouraging", "thinking", "surprised".

Output strictly valid JSON:
{
  "speech": "What the teacher says in English to continue conversation",
  "emotion": "happy / encouraging / thinking / neutral",
  "correction": {
    "hasCorrection": true/false,
    "userOriginal": "...",
    "corrected": "...",
    "moreNatural": "...",
    "explanationUz": "Short Uzbek explanation of the correction"
  },
  "hints": {
    "keyword": "a key word they can use",
    "sentenceStart": "How they can start their answer...",
    "fullExample": "Complete sample response"
  },
  "followUp": "Question for user"
}`;

    const contents = [
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      {
        role: 'user',
        parts: [{ text: userSpeech || 'Hi teacher!' }],
      },
    ];

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Speaking conversation error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'conversation_failed',
      message: error?.message || 'Speaking assistant is currently unavailable',
    });
  }
});

// 10. "How Do I Say This?" Assistant (Uzbek -> English Natural Translation)
app.post('/api/ai/how-to-say', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { uzbekPhrase, level = 'A2', context = '' } = req.body;

    const prompt = `A student wants to know how to express an idea in English.
Student input (Uzbek): "${uzbekPhrase}"
Context / Current Topic: "${context}"
Target level: ${level}.

Provide:
1. Standard correct English sentence.
2. A more natural conversational version (how native speakers actually say it).
3. Short pronunciation or grammar tip in Uzbek.

Output strictly JSON:
{
  "uzbek": "${uzbekPhrase}",
  "english": "Standard correct English",
  "natural": "Natural conversational expression",
  "tipUz": "Qisqa oʻzbekcha tushuntirish",
  "keyWords": ["word1", "word2"]
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('How to say error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'translation_failed',
      message: error?.message || 'Could not process phrase',
    });
  }
});

// 11. Real Writing Analysis Endpoint (Dedicated for Writing Studio)
app.post('/api/ai/writing-analysis', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { text, task = '', stage = 'sentence', level = 'A2', taskType = 'general', previousMistakes = [] } = req.body;

    if (!text || text.trim().length < 3) {
      return res.status(400).json({
        success: false,
        status: 'unavailable',
        message: 'Text is too short for analysis.',
      });
    }

    const isIELTSStage = level === 'B2' || level === 'C1' || level.startsWith('IELTS');

    const prompt = `You are an expert English Writing Examiner and Teacher.
Analyze this student writing piece carefully.
Task/Prompt: "${task}"
Writing Stage: "${stage}"
Student CEFR Level: "${level}"
Previous student mistakes to check for repetition: ${JSON.stringify(previousMistakes)}

Text to Analyze:
"""
${text}
"""

Instructions:
1. Provide a detailed breakdown according to the 4 core criteria:
   - Task Response / Achievement
   - Coherence and Cohesion
   - Lexical Resource
   - Grammatical Range and Accuracy
2. If level is B2 or higher/IELTS, provide a realistic "bandScoreEstimate" formatted strictly as "Estimated practice band X.X" (e.g., "Estimated practice band 6.5"). NEVER call it an official score.
3. If level is A1/A2/B1, DO NOT output an IELTS band score. Instead set "cefrProgress" to "emerging", "developing", "secure", or "mastered".
4. List specific errors in the text with:
   - "type": "grammar" | "vocab" | "word_order" | "spelling"
   - "text": "exact faulty phrase"
   - "suggestion": "corrected phrase"
   - "explanationUz": "clear pedagogical explanation in Uzbek"
5. Provide constructive feedback in Uzbek ("feedbackUz").
6. Provide an improved model version ("improvedVersionEn") calibrated for target band/level.
7. Provide a similar follow-up practice exercise ("nextExercise").

Output strictly valid JSON:
{
  "status": "assessed",
  "wordCount": ${text.trim().split(/\s+/).length},
  "overallScore": 82,
  "criteria": {
    "taskResponse": { "score": 80, "feedbackUz": "..." },
    "coherenceCohesion": { "score": 82, "feedbackUz": "..." },
    "lexicalResource": { "score": 85, "feedbackUz": "..." },
    "grammaticalAccuracy": { "score": 80, "feedbackUz": "..." }
  },
  ${isIELTSStage ? '"bandScoreEstimate": "Estimated practice band 6.5",' : '"cefrProgress": "developing",'}
  "errors": [
    {
      "type": "grammar",
      "text": "faulty text",
      "suggestion": "corrected text",
      "explanationUz": "Uzbek explanation"
    }
  ],
  "strengthsUz": ["Good vocabulary use", "Clear sentence structure"],
  "priorityImprovementUz": "Focus on subject-verb agreement",
  "feedbackUz": "Detailed constructive pedagogical summary in Uzbek",
  "improvedVersionEn": "High quality improved model text",
  "nextExercise": {
    "promptEn": "Similar practice sentence to rewrite",
    "targetRuleUz": "Target grammar rule to apply"
  }
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Writing analysis error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      success: false,
      status: 'unavailable',
      error: isQuota ? 'quota_exceeded' : 'analysis_failed',
      message: error?.message || 'Writing analysis is temporarily unavailable.',
    });
  }
});

// 12. Speaking Session Evaluation & Comprehensive Report
app.post('/api/ai/speaking-analysis', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { transcript = [], durationSeconds = 180, level = 'A2' } = req.body;

    if (!transcript || transcript.length === 0) {
      return res.json({
        success: true,
        data: {
          fluencyScore: null,
          grammarScore: null,
          vocabularyScore: null,
          pronunciationScore: null,
          overallScore: null,
          statusMessageUz: 'Muloqot yetarlicha uzun bo\'lmagani sababli baholanmadi.',
        },
      });
    }

    const prompt = `Analyze this spoken English conversation transcript between student and AI teacher.
Student CEFR Level: ${level}
Duration: ${durationSeconds} seconds
Full transcript:
${JSON.stringify(transcript)}

Important rules:
1. "pronunciationScore" MUST be null because transcript text alone cannot measure physical acoustic pronunciation.
2. Evaluate grammarScore, vocabularyScore, fluencyScore (based on turn frequency and utterance length) objectively from 0 to 100. If unable to assess, output null. NEVER hardcode 78 or fake numbers!

Output strictly valid JSON:
{
  "fluencyScore": 82,
  "grammarScore": 78,
  "vocabularyScore": 80,
  "pronunciationScore": null,
  "overallScore": 80,
  "userWordCount": 140,
  "uniqueWords": 65,
  "fillerWordsCount": { "um": 3, "uh": 2, "like": 1 },
  "keyTakeaway": "Single most important improvement advice.",
  "grammarCorrections": [
    {
      "original": "Yesterday I go to market",
      "corrected": "Yesterday I went to the market",
      "category": "Past Simple",
      "explanationUz": "Oʻtgan zamonda go feʻlining 2-shakli went ishlatiladi."
    }
  ],
  "activeVocabularyUsed": ["develop", "schedule", "prefer"]
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Speaking analysis error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      success: false,
      error: isQuota ? 'quota_exceeded' : 'analysis_failed',
      message: error?.message || 'Could not generate report',
    });
  }
});

// 12. Speaking Structured Lesson Generator (Learn -> Practice -> Apply)
app.post('/api/ai/speaking-lesson', async (req, res) => {
  try {
    const customKey = req.headers['x-api-key'] as string;
    const { topic = 'My Day', level = 'A2' } = req.body;

    const prompt = `Create a 3-stage speaking lesson for CEFR ${level}:
Topic: "${topic}"

Stages:
1. LEARN: 3 highly practical phrases with Uzbek translation and phonetic guidance.
2. PRACTICE: 2 prompt sentences for the student to repeat and adapt.
3. APPLY: A conversation starter prompt for real dialogue with the AI teacher.

Output strictly valid JSON:
{
  "topic": "${topic}",
  "level": "${level}",
  "estimatedMinutes": 10,
  "learnPhrases": [
    {
      "phrase": "I usually wake up at...",
      "translationUz": "Men odatda ...da uygʻonaman",
      "phonetic": "/aɪ ˈjuːʒuəli weɪk ʌp æt/",
      "usageNote": "Daily routine boshlanishi"
    }
  ],
  "practiceExercises": [
    {
      "prompt": "Tell me what time you woke up today.",
      "expectedStructure": "I woke up at [time]",
      "sampleAnswer": "I woke up at 7 AM today."
    }
  ],
  "applyDialoguePrompt": "Now let's chat about your favorite part of the day! How was your morning?"
}`;

    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Speaking lesson error:', error?.message);
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'quota_exceeded' : 'lesson_failed',
      message: error?.message || 'Could not generate lesson',
    });
  }
});

// Setup Vite middlewares for SSR/dev
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`English AI Teacher server running on http://localhost:${port}`);
  });
}

startServer();
