import { TeacherProfile } from '../../types';

const TEACHER_PROFILE_KEY = 'eng_teacher_global_profile_v2';

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  id: 'teacher_aisha',
  name: 'Aisha',
  vrmModelUrl: null,
  vrmModelName: undefined,
  avatarStyle: 'stylized_humanoid',
  personality: 'Friendly',
  correctionStyle: 'Balanced',
  speakingSpeed: 1.0,
  preferredUzbekVoiceId: 'uz_madina',
  preferredEnglishVoiceId: 'en_sarah',
  supportLanguage: 'auto',
  animationEnabled: true,
  lipSyncEnabled: true,
  emotionEnabled: true,
};

type ProfileListener = (profile: TeacherProfile) => void;

class GlobalTeacherManager {
  private currentProfile: TeacherProfile = DEFAULT_TEACHER_PROFILE;
  private listeners: Set<ProfileListener> = new Set();

  constructor() {
    this.loadProfile();
  }

  private loadProfile() {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(TEACHER_PROFILE_KEY);
      if (data) {
        this.currentProfile = { ...DEFAULT_TEACHER_PROFILE, ...JSON.parse(data) };
      }
    } catch {
      this.currentProfile = DEFAULT_TEACHER_PROFILE;
    }
  }

  getProfile(): TeacherProfile {
    return { ...this.currentProfile };
  }

  updateProfile(partial: Partial<TeacherProfile>): TeacherProfile {
    this.currentProfile = { ...this.currentProfile, ...partial };
    if (typeof window !== 'undefined') {
      localStorage.setItem(TEACHER_PROFILE_KEY, JSON.stringify(this.currentProfile));
    }
    this.notify();
    return { ...this.currentProfile };
  }

  onProfileChange(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.currentProfile }));
  }
}

export const globalTeacherManager = new GlobalTeacherManager();
