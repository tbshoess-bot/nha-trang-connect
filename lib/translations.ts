export type Lang = "en" | "ru";

export const translations = {
  en: {
    // Header
    share: "+ Share",
    login: "Login",

    // Feed
    loadingFeed: "Loading feed...",
    noPosts: "No posts yet.",
    noPostsHint: "Be the first to share an event or question.",

    // Login
    signIn: "Sign in",
    emailPlaceholder: "email@example.com",
    sendLoginLink: "Send login link",
    checkEmail: "Check your email",
    checkEmailHint: (email: string) => `We sent a login link to ${email}.`,

    // New post
    whatToShare: "What do you want to share?",
    askQuestion: "Ask a question",
    createEvent: "Create event",
    questionLabel: "What's your question?",
    eventTitleLabel: "Event title",
    questionPlaceholder: "e.g. Where is the best exchange office?",
    eventTitlePlaceholder: "e.g. Anyone up for diving tonight?",
    details: "Details (optional)",
    category: "Category",
    dateTime: "Date and time",
    location: "Location",
    locationPlaceholder: "e.g. Hon Mun island, boat pier",
    postBtn: "Share",
    mustLogin: "You must log in first.",

    // Post detail
    eventBadge: "Event",
    questionBadge: "Question",
    peopleAttending: "people attending",
    joined: "Joined",
    join: "Join",
    answers: "answers",
    bestAnswer: "✓ Best answer",
    markBest: "Mark as best answer",
    answerPlaceholder: "Write your answer...",
    answerBtn: "Answer",
    loading: "Loading...",
    notFound: "Content not found.",

    // Profile setup
    setupProfile: "Set up your profile",
    nameLabel: "Name",
    bioLabel: "Short bio",
    whoAreYou: "Who are you?",
    tourist: "Tourist / backpacker",
    expat: "Expat",
    interests: "Your interests",
    saveAndGo: "Save and go to feed",

    // Interests
    interestOptions: ["Diving", "Beach", "Nightlife", "Yoga", "Language practice", "Food"],

    // Question categories
    categories: [
      { value: "money", label: "Money / exchange" },
      { value: "shopping", label: "Shopping" },
      { value: "health", label: "Health" },
      { value: "transport", label: "Transport" },
      { value: "entertainment", label: "Entertainment" },
      { value: "other", label: "Other" },
    ],

    // Event categories
    eventCategories: [
      { value: "party", label: "🎉 Party" },
      { value: "trip", label: "🚤 Day trip / boat tour" },
      { value: "meetup", label: "☕ Meetup / hangout" },
      { value: "diving", label: "🤿 Diving / snorkeling" },
      { value: "sport", label: "🏄 Sport / activity" },
      { value: "food", label: "🍜 Food & drinks" },
      { value: "language", label: "🗣️ Language exchange" },
      { value: "yoga", label: "🧘 Yoga / wellness" },
      { value: "nightlife", label: "🌙 Nightlife / bar crawl" },
      { value: "other", label: "📌 Other" },
    ],

    // PostCard
    participant: "participants",
    answerCount: "answers",
  },

  ru: {
    // Header
    share: "+ Поделиться",
    login: "Войти",

    // Feed
    loadingFeed: "Загрузка...",
    noPosts: "Публикаций пока нет.",
    noPostsHint: "Поделитесь первым событием или вопросом.",

    // Login
    signIn: "Войти",
    emailPlaceholder: "email@example.com",
    sendLoginLink: "Отправить ссылку",
    checkEmail: "Проверьте почту",
    checkEmailHint: (email: string) => `Мы отправили ссылку для входа на ${email}.`,

    // New post
    whatToShare: "Чем хотите поделиться?",
    askQuestion: "Задать вопрос",
    createEvent: "Создать событие",
    questionLabel: "Ваш вопрос?",
    eventTitleLabel: "Название события",
    questionPlaceholder: "Напр.: Где лучший обменник?",
    eventTitlePlaceholder: "Напр.: Кто хочет нырять сегодня вечером?",
    details: "Детали (необязательно)",
    category: "Категория",
    dateTime: "Дата и время",
    location: "Место",
    locationPlaceholder: "Напр.: остров Хон Мун, пирс",
    postBtn: "Поделиться",
    mustLogin: "Сначала войдите в систему.",

    // Post detail
    eventBadge: "Событие",
    questionBadge: "Вопрос",
    peopleAttending: "участников",
    joined: "Вы участвуете",
    join: "Присоединиться",
    answers: "ответов",
    bestAnswer: "✓ Лучший ответ",
    markBest: "Отметить как лучший ответ",
    answerPlaceholder: "Напишите ответ...",
    answerBtn: "Ответить",
    loading: "Загрузка...",
    notFound: "Контент не найден.",

    // Profile setup
    setupProfile: "Настройте профиль",
    nameLabel: "Имя",
    bioLabel: "Краткое описание",
    whoAreYou: "Кто вы?",
    tourist: "Турист / бэкпекер",
    expat: "Экспат",
    interests: "Ваши интересы",
    saveAndGo: "Сохранить и перейти",

    // Interests
    interestOptions: ["Дайвинг", "Пляж", "Ночная жизнь", "Йога", "Языковая практика", "Еда"],

    // Question categories
    categories: [
      { value: "money", label: "Деньги / обмен" },
      { value: "shopping", label: "Шопинг" },
      { value: "health", label: "Здоровье" },
      { value: "transport", label: "Транспорт" },
      { value: "entertainment", label: "Развлечения" },
      { value: "other", label: "Другое" },
    ],

    // Event categories
    eventCategories: [
      { value: "party", label: "🎉 Вечеринка" },
      { value: "trip", label: "🚤 Поездка / морская прогулка" },
      { value: "meetup", label: "☕ Встреча / тусовка" },
      { value: "diving", label: "🤿 Дайвинг / снорклинг" },
      { value: "sport", label: "🏄 Спорт / активности" },
      { value: "food", label: "🍜 Еда и напитки" },
      { value: "language", label: "🗣️ Языковой обмен" },
      { value: "yoga", label: "🧘 Йога / велнес" },
      { value: "nightlife", label: "🌙 Ночная жизнь / бар-хоппинг" },
      { value: "other", label: "📌 Другое" },
    ],

    // PostCard
    participant: "участников",
    answerCount: "ответов",
  },
} as const;
