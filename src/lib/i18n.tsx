import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ta";

const STORAGE_KEY = "learnmate_lang";

type Dict = Record<string, string>;

const en: Dict = {
  // nav
  "nav.dashboard": "Dashboard",
  "nav.tutor": "AI Tutor",
  "nav.voice": "Voice Assistant",
  "nav.materials": "Study Materials",
  "nav.quiz": "Quiz Center",
  "nav.analytics": "Analytics",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "nav.search": "Search topics, notes, quizzes...",
  "nav.signout": "Sign out",
  "nav.upgrade": "Upgrade to Pro",
  "nav.upgrade.desc": "Unlock unlimited AI tutoring",
  "nav.upgrade.cta": "Upgrade",

  // dashboard home
  "home.welcome": "Welcome back 👋",
  "home.subtitle": "Here's your learning snapshot for today.",
  "home.startVoice": "Start Voice Session",
  "home.stat.hours": "Total Learning Hours",
  "home.stat.questions": "Questions Asked",
  "home.stat.avg": "Quiz Score Average",
  "home.stat.streak": "Learning Streak",
  "home.weekly": "Weekly Learning Activity",
  "home.weekly.desc": "Hours studied per day",
  "home.quick": "Quick Actions",
  "home.quick.desc": "Jump back in",
  "home.subject": "Subject Performance",
  "home.progress": "Learning Progress",
  "home.recent": "Recent Topics",

  // tutor
  "tutor.title": "AI Tutor",
  "tutor.subtitle": "Personalized explanations on any topic",
  "tutor.prompt": "What do you want to learn today?",

  // quiz
  "quiz.title": "Quiz Center",
  "quiz.subtitle": "Generate quizzes from your uploaded materials",

  // analytics
  "analytics.title": "Learning Analytics",
  "analytics.subtitle": "Track your progress and performance",

  // materials
  "materials.title": "Study Materials",
  "materials.subtitle": "Upload PDFs and ask questions with citations",

  // profile
  "profile.edit": "Edit Profile",
  "profile.stat.materials": "Uploaded Materials",
  "profile.stat.quizzes": "Quizzes Taken",
  "profile.stat.chats": "AI Tutor Chats",
  "profile.stat.voice": "Voice Sessions",
  "profile.analytics": "Study Analytics",
  "profile.avg": "Average Quiz Score",
  "profile.total": "Total Attempts",
  "profile.docs": "Documents Studied",

  // settings
  "settings.title": "Settings",
  "settings.subtitle": "Customize LearnMate to fit how you learn.",
  "settings.appearance": "Appearance",
  "settings.darkMode": "Dark Mode",
  "settings.darkMode.desc": "Easier on your eyes during late-night study",
  "settings.language": "Language & Voice",
  "settings.interfaceLang": "Interface Language",
  "settings.voice": "AI Voice",
  "settings.notifications": "Notifications",
  "settings.account": "Account",
  "settings.changePassword": "Change Password",
  "settings.exportData": "Export My Data",
  "settings.deleteAccount": "Delete Account",

  // change password dialog
  "cp.title": "Change Password",
  "cp.desc": "Enter your current password and choose a new one.",
  "cp.current": "Current Password",
  "cp.new": "New Password",
  "cp.confirm": "Confirm New Password",
  "cp.cancel": "Cancel",
  "cp.save": "Update Password",
  "cp.err.required": "All fields are required",
  "cp.err.length": "New password must be at least 8 characters",
  "cp.err.match": "New password and confirmation do not match",
  "cp.err.same": "New password must be different from current password",
  "cp.err.currentWrong": "Current password is incorrect",
  "cp.success": "Password updated successfully",

  // export
  "export.success": "Your data has been downloaded",
  "export.error": "Failed to export data",
  "export.preparing": "Preparing your data...",
};

const ta: Dict = {
  "nav.dashboard": "டாஷ்போர்டு",
  "nav.tutor": "AI ஆசிரியர்",
  "nav.voice": "குரல் உதவியாளர்",
  "nav.materials": "படிப்பு பொருட்கள்",
  "nav.quiz": "வினாடி வினா மையம்",
  "nav.analytics": "பகுப்பாய்வு",
  "nav.profile": "சுயவிவரம்",
  "nav.settings": "அமைப்புகள்",
  "nav.search": "தலைப்புகள், குறிப்புகள், வினாக்களைத் தேடு...",
  "nav.signout": "வெளியேறு",
  "nav.upgrade": "Pro ஆக மேம்படுத்து",
  "nav.upgrade.desc": "வரம்பற்ற AI ஆசிரியரை திற",
  "nav.upgrade.cta": "மேம்படுத்து",

  "home.welcome": "மீண்டும் வரவேற்கிறோம் 👋",
  "home.subtitle": "இன்றைய உங்கள் கற்றல் சுருக்கம்.",
  "home.startVoice": "குரல் அமர்வைத் தொடங்கு",
  "home.stat.hours": "மொத்த கற்றல் நேரம்",
  "home.stat.questions": "கேட்கப்பட்ட கேள்விகள்",
  "home.stat.avg": "சராசரி வினாடி வினா மதிப்பெண்",
  "home.stat.streak": "கற்றல் தொடர்ச்சி",
  "home.weekly": "வாராந்திர கற்றல் நடவடிக்கை",
  "home.weekly.desc": "நாள் ஒன்றுக்கு படித்த மணி நேரம்",
  "home.quick": "விரைவு செயல்கள்",
  "home.quick.desc": "மீண்டும் தொடர்க",
  "home.subject": "பாடம் வாரியான செயல்திறன்",
  "home.progress": "கற்றல் முன்னேற்றம்",
  "home.recent": "சமீபத்திய தலைப்புகள்",

  "tutor.title": "AI ஆசிரியர்",
  "tutor.subtitle": "எந்த தலைப்பிலும் தனிப்பயனாக்கப்பட்ட விளக்கங்கள்",
  "tutor.prompt": "இன்று நீங்கள் என்ன கற்க விரும்புகிறீர்கள்?",

  "quiz.title": "வினாடி வினா மையம்",
  "quiz.subtitle": "பதிவேற்றிய பொருட்களிலிருந்து வினாக்களை உருவாக்கு",

  "analytics.title": "கற்றல் பகுப்பாய்வு",
  "analytics.subtitle": "உங்கள் முன்னேற்றத்தையும் செயல்திறனையும் கண்காணிக்கவும்",

  "materials.title": "படிப்பு பொருட்கள்",
  "materials.subtitle": "PDF களை பதிவேற்றவும், மேற்கோள்களுடன் கேள்விகளைக் கேட்கவும்",

  "profile.edit": "சுயவிவரத்தை திருத்து",
  "profile.stat.materials": "பதிவேற்றிய பொருட்கள்",
  "profile.stat.quizzes": "எடுத்த வினாடி வினாக்கள்",
  "profile.stat.chats": "AI ஆசிரியர் அரட்டைகள்",
  "profile.stat.voice": "குரல் அமர்வுகள்",
  "profile.analytics": "படிப்பு பகுப்பாய்வு",
  "profile.avg": "சராசரி வினாடி வினா மதிப்பெண்",
  "profile.total": "மொத்த முயற்சிகள்",
  "profile.docs": "படித்த ஆவணங்கள்",

  "settings.title": "அமைப்புகள்",
  "settings.subtitle": "உங்கள் கற்றல் முறைக்கு LearnMate ஐ தனிப்பயனாக்குங்கள்.",
  "settings.appearance": "தோற்றம்",
  "settings.darkMode": "இருள் பயன்முறை",
  "settings.darkMode.desc": "இரவு நேர படிப்புக்கு கண்களுக்கு எளிது",
  "settings.language": "மொழி மற்றும் குரல்",
  "settings.interfaceLang": "இடைமுக மொழி",
  "settings.voice": "AI குரல்",
  "settings.notifications": "அறிவிப்புகள்",
  "settings.account": "கணக்கு",
  "settings.changePassword": "கடவுச்சொல்லை மாற்று",
  "settings.exportData": "எனது தரவை ஏற்றுமதி செய்",
  "settings.deleteAccount": "கணக்கை நீக்கு",

  "cp.title": "கடவுச்சொல்லை மாற்று",
  "cp.desc": "தற்போதைய கடவுச்சொல்லை உள்ளிட்டு புதியதை தேர்ந்தெடுக்கவும்.",
  "cp.current": "தற்போதைய கடவுச்சொல்",
  "cp.new": "புதிய கடவுச்சொல்",
  "cp.confirm": "புதிய கடவுச்சொல்லை உறுதி செய்",
  "cp.cancel": "ரத்து",
  "cp.save": "கடவுச்சொல்லை புதுப்பி",
  "cp.err.required": "அனைத்து புலங்களும் தேவை",
  "cp.err.length": "புதிய கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்",
  "cp.err.match": "புதிய கடவுச்சொல்லும் உறுதிப்படுத்தலும் பொருந்தவில்லை",
  "cp.err.same": "புதிய கடவுச்சொல் தற்போதைய கடவுச்சொல்லில் இருந்து வேறுபட்டதாக இருக்க வேண்டும்",
  "cp.err.currentWrong": "தற்போதைய கடவுச்சொல் தவறானது",
  "cp.success": "கடவுச்சொல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது",

  "export.success": "உங்கள் தரவு பதிவிறக்கம் செய்யப்பட்டது",
  "export.error": "தரவை ஏற்றுமதி செய்ய முடியவில்லை",
  "export.preparing": "உங்கள் தரவை தயாரிக்கிறது...",
};

const dicts: Record<Lang, Dict> = { en, ta };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as Lang | null;
    if (saved === "en" || saved === "ta") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string) => dicts[lang][key] ?? dicts.en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useContext(I18nContext).t;
}
