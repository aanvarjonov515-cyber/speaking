import { TeacherVoice } from '../../types';

export const UZBEK_VOICE_REGISTRY: TeacherVoice[] = [
  // 5 Distinct Female Uzbek Voices
  {
    id: 'uz_madina',
    provider: 'uzbek_natural',
    displayName: 'Madina',
    region: 'Toshkent',
    gender: 'female',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Tabiiy, aniq va akademik toza talaffuz (Toshkent aksenti)',
    samplePhraseUz: 'Assalomu alaykum! Bugun ingliz tilida birga gaplashamiz.',
    samplePhraseEn: "Hello! Let's practice English conversation together today.",
    isFavorite: true,
  },
  {
    id: 'uz_zilola',
    provider: 'uzbek_natural',
    displayName: 'Zilola',
    region: 'Samarqand',
    gender: 'female',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Iliq, sokin va sabrli murabbiy ohangi (Samarqand aksenti)',
    samplePhraseUz: 'Xush kelibsiz! Har qanday xatodan qoʻrqmasdan bemalol gapiring.',
    samplePhraseEn: "Welcome! Don't hesitate to make mistakes, I'm here to guide you.",
  },
  {
    id: 'uz_nigora',
    provider: 'uzbek_natural',
    displayName: 'Nigora',
    region: 'Fargʻona',
    gender: 'female',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Jonli, motivatsiyaga toʻla va ifodali ovoz (Vodiy aksenti)',
    samplePhraseUz: 'Ajoyib natijaga erishish uchun har kuni 10 daqiqa mashq yetarli!',
    samplePhraseEn: 'Consistency is key! Just ten minutes of speaking will build your fluency.',
  },
  {
    id: 'uz_shahzoda',
    provider: 'uzbek_natural',
    displayName: 'Shahzoda',
    region: 'Buxoro',
    gender: 'female',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'natural',
    descriptionUz: 'Klassik, mayin va musiqiy jarangdor talaffuz (Buxoro)',
    samplePhraseUz: 'Ingliz tilida fikringizni ifoda etishni qadamma-qadam oʻrganamiz.',
    samplePhraseEn: 'Step by step, expressing your thoughts in English becomes second nature.',
  },
  {
    id: 'uz_dilnoza',
    provider: 'uzbek_natural',
    displayName: 'Dilnoza',
    region: 'Andijon',
    gender: 'female',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Samimiy, tushunarli va doʻstona ovoz (Andijon)',
    samplePhraseUz: 'Bugun qaysi mavzuda suhbatlashishni xohlaysiz?',
    samplePhraseEn: 'What exciting topic would you like to discuss today?',
  },

  // 5 Distinct Male Uzbek Voices
  {
    id: 'uz_jasur',
    provider: 'uzbek_natural',
    displayName: 'Jasur',
    region: 'Toshkent',
    gender: 'male',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Professional, chuqur va qatʼiyatli biznes ohangi (Toshkent)',
    samplePhraseUz: 'Assalomu alaykum! Bugungi darsimizni boshlashga tayyormisiz?',
    samplePhraseEn: 'Welcome! Are you ready to sharpen your conversational English today?',
    isFavorite: true,
  },
  {
    id: 'uz_alisher',
    provider: 'uzbek_natural',
    displayName: 'Alisher',
    region: 'Samarqand',
    gender: 'male',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Doʻstona, mehmondoʻst va iliq oʻqituvchi ovozi (Samarqand)',
    samplePhraseUz: 'Ingliz tilida bemalol gapirish - mashq va tajriba mahsulidir.',
    samplePhraseEn: 'Speaking English naturally is simply a matter of daily active practice.',
  },
  {
    id: 'uz_bobur',
    provider: 'uzbek_natural',
    displayName: 'Bobur',
    region: 'Fargʻona',
    gender: 'male',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Zamonaviy, chaqqon va texnologik yondashuv (Fargʻona)',
    samplePhraseUz: 'Qani boshladik! Yangi soʻzlarni amalda qoʻllab koʻramiz.',
    samplePhraseEn: "Let's dive in and practice these new phrases in real conversation.",
  },
  {
    id: 'uz_ulugbek',
    provider: 'uzbek_natural',
    displayName: 'Ulugʻbek',
    region: 'Buxoro',
    gender: 'male',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'natural',
    descriptionUz: 'Bosiq, ilmiy va tahliliy ustoz ohangi (Buxoro)',
    samplePhraseUz: 'Har bir gapning maʼnosi va grammatikasiga eʼtibor beramiz.',
    samplePhraseEn: 'We will pay careful attention to grammar nuance and natural expression.',
  },
  {
    id: 'uz_farhod',
    provider: 'uzbek_natural',
    displayName: 'Farhod',
    region: 'Xorazm',
    gender: 'male',
    languages: ['uz-UZ', 'en-US'],
    locale: 'uz-UZ',
    nativeUzbek: true,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Kuchli, ishonchli va ochiqkoʻngil ovoz (Xorazm)',
    samplePhraseUz: 'Salom doʻstim! Bugun ingliz tilidagi yangi pogʻonaga chiqamiz.',
    samplePhraseEn: 'Hello my friend! Today we will level up your English communication skills.',
  },
];

export const ENGLISH_VOICE_REGISTRY: TeacherVoice[] = [
  {
    id: 'en_sarah',
    provider: 'system',
    displayName: 'Sarah (US)',
    region: 'North America',
    gender: 'female',
    languages: ['en-US'],
    locale: 'en-US',
    nativeUzbek: false,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Clear American accent, ideal for daily conversation and vocabulary',
    samplePhraseUz: 'Assalomu alaykum! I am Sarah, your English coach.',
    samplePhraseEn: 'Hello! I am Sarah, your conversational English teacher.',
    isFavorite: true,
  },
  {
    id: 'en_daniel',
    provider: 'system',
    displayName: 'Daniel (UK)',
    region: 'United Kingdom',
    gender: 'male',
    languages: ['en-GB'],
    locale: 'en-GB',
    nativeUzbek: false,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'ultra_hd',
    descriptionUz: 'Refined British accent, excellent for IELTS and formal communication',
    samplePhraseUz: 'Salom! I am Daniel, ready for British English practice.',
    samplePhraseEn: 'Greetings! I am Daniel, ready to assist your British English speech.',
    isFavorite: true,
  },
  {
    id: 'en_emily',
    provider: 'system',
    displayName: 'Emily (US)',
    region: 'North America',
    gender: 'female',
    languages: ['en-US'],
    locale: 'en-US',
    nativeUzbek: false,
    supportsEnglish: true,
    supportsSpeed: true,
    quality: 'natural',
    descriptionUz: 'Warm, encouraging pace tailored for beginner and intermediate learners',
    samplePhraseUz: 'Salom! Keling birga inglizcha gaplashamiz.',
    samplePhraseEn: "Hi there! I am Emily. Let's make learning English fun and easy.",
  },
];

export class VoiceRegistryService {
  static getAllUzbekVoices(): TeacherVoice[] {
    return UZBEK_VOICE_REGISTRY;
  }

  static getAllEnglishVoices(): TeacherVoice[] {
    return ENGLISH_VOICE_REGISTRY;
  }

  static getVoiceById(id: string): TeacherVoice | undefined {
    return [...UZBEK_VOICE_REGISTRY, ...ENGLISH_VOICE_REGISTRY].find((v) => v.id === id);
  }

  // Play voice preview sample
  static playPreview(voiceId: string, lang: 'uz' | 'en' = 'uz', onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    const voice = this.getVoiceById(voiceId);
    const text = lang === 'uz' ? (voice?.samplePhraseUz || 'Assalomu alaykum!') : (voice?.samplePhraseEn || 'Hello!');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    // Pick system voices matching locale
    const available = window.speechSynthesis.getVoices();
    if (lang === 'uz') {
      // Uzbek or high quality match
      const matched = available.find((v) => v.lang.startsWith('uz') || v.lang.startsWith('tr'));
      if (matched) utterance.voice = matched;
    } else {
      const matched = available.find(
        (v) => (voice?.gender === 'male' ? v.name.includes('Male') || v.name.includes('David') : v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira'))
      );
      if (matched) utterance.voice = matched;
    }

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  }
}
