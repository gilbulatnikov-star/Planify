// Hebrew labels for the entire app
export const he = {
  // Navigation
  nav: {
    dashboard: "לוח בקרה",
    projects: "פרויקטים",
    clients: "לקוחות",
    equipment: "ציוד",
    financials: "כספים",
    calendar: "לוח תוכן",
    contacts: "אנשי קשר",
    subscriptions: "הוצאות חודשיות",
    travelLog: "יומן נסיעות",
    assets: "רישיונות",
    inspiration: "השראה",
    cheatSheets: "מדריכים",
    scripts: "תסריטים",
    moodboard: "Moodboard",
    billing: "מנוי ותמחור",
  },

  // Dashboard
  dashboard: {
    title: "לוח בקרה",
    activeProjects: "פרויקטים פעילים",
    upcomingShoots: "אירועים קרובים",
    pendingDeadlines: "דדליינים ממתינים",
    monthlyRevenue: "הכנסה חודשית",
    outstandingInvoices: "חשבוניות פתוחות",
    conversionRate: "יחס המרה",
    recentProjects: "פרויקטים אחרונים",
    recentClients: "לקוחות אחרונים",
    noProjects: "אין פרויקטים פעילים",
    noShoots: "אין אירועים קרובים",
  },

  // Projects
  project: {
    title: "פרויקטים",
    newProject: "פרויקט חדש",
    phases: {
      // Legacy
      pre_production:    "לפני הצילומים",
      production:        "ימי צילום",
      post_production:   "עריכה",
      delivered:         "הושלם",
      revisions:         "תיקונים",
      // Photography
      coordination:      "תיאום",
      shoot_day:         "יום הצילום",
      shoot_days:        "ימי הצילום",
      selection:         "ברירה",
      editing:           "עריכה",
      gallery_delivery:  "גלריה למסירה",
      // Video / Content
      brief:             "בריף",
      planning:          "תכנון",
      monthly_planning:  "תכנון חודשי",
      research:          "מחקר",
      recording:         "הקלטה",
      writing:           "כתיבה",
      graphics:          "גרפיקה",
      waiting_approval:  "ממתין לאישור",
      published:         "פורסם",
      scheduling:        "תזמון",
      active:            "פעיל",
      // Editing
      materials_received: "חומרים התקבלו",
      first_cut:          "גרסה ראשונה",
      draft:              "טיוטה",
    },
    statuses: {
      pitching:       "בגיבוש",
      scripting:      "כתיבת תסריט",
      moodboards:     "בניית תדמית",
      location_scouting: "חיפוש לוקיישן",
      scheduled:      "מתוכנן",
      shooting:       "בצילומים",
      wrapping:       "סיום צילומים",
      ingest_sync:    "העברת חומרים",
      rough_cut:      "גרסה ראשונה",
      revisions_v1:   "תיקון ראשון",
      revisions_v2:   "תיקון שני",
      color_sound:    "גימור",
      final_delivery: "מסירה ללקוח",
      delivered:      "הושלם",
      archived:       "בארכיון",
    },
    types: {
      // Legacy (kept for backward compat)
      youtube:     "סרטון YouTube",
      music_video: "קליפ מוזיקלי",
      commercial:  "פרסומת",
      corporate:   "תדמית",
      social:      "סושיאל",
      // Photography
      wedding:             "חתונה",
      bar_bat_mitzva:      "בר / בת מצווה",
      event_photo:         "אירוע",
      portrait:            "פורטרט / מיני סשן",
      product_photography: "צילום מוצר",
      real_estate:         'נדל"ן',
      fashion:             "אופנה / מוד",
      family:              "משפחה / הריון",
      // Video
      podcast:   "פודקאסט",
      interview: "כתבה / ריאיון",
      bts:       "BTS",
      // Content
      reel:             "ריל / סטורי",
      post_carousel:    "פוסט / קרוסלה",
      page_management:  "ניהול עמוד (ריטיינר)",
      content_strategy: "אסטרטגיית תוכן",
      // Editing
      video_editing:   "עריכת וידאו",
      podcast_editing: "עריכת פודקאסט",
      motion_graphics: "גרפיקה / מושן",
    },
    shootDate: "תאריך",
    deadline:  "דדליין",
    budget:    "תקציב",
    client:    "לקוח",
    description: "תיאור",
    type: "סוג פרויקט",
  },

  // Clients
  client: {
    title: "לקוחות",
    newClient: "לקוח חדש",
    newLead: "ליד חדש",
    name: "שם",
    email: "אימייל",
    phone: "טלפון",
    company: "חברה",
    notes: "הערות",
    type: "סוג",
    types: {
      lead: "ליד",
      client: "לקוח",
    },
    leadSource: "מקור ליד",
    leadSources: {
      linkedin: "LinkedIn",
      organic: "אורגני",
      referral: "הפניה",
      website: "אתר",
      social: "רשתות חברתיות",
      other: "אחר",
    },
    leadStatus: "סטטוס ליד",
    leadStatuses: {
      new: "חדש",
      contacted: "נוצר קשר",
      qualified: "מתאים",
      proposal_sent: "הצעה נשלחה",
      won: "נסגר",
      lost: "אבוד",
    },
    interactions: "היסטוריית אינטראקציות",
    interactionTypes: {
      call: "שיחה",
      email: "אימייל",
      meeting: "פגישה",
      note: "הערה",
    },
  },

  // Equipment
  equipment: {
    title: "ציוד",
    newItem: "פריט חדש",
    name: "שם",
    category: "קטגוריה",
    brand: "מותג",
    model: "דגם",
    serialNumber: "מספר סריאלי",
    purchasePrice: "מחיר רכישה",
    status: "סטטוס",
    categories: {
      camera: "מצלמה",
      lens: "עדשה",
      drone: "רחפן",
      lighting: "תאורה",
      audio: "אודיו",
      grip: "גריפ",
      other: "אחר",
    },
    statuses: {
      available: "זמין",
      rented: "מושכר",
      in_repair: "בתיקון",
      retired: "לא בשימוש",
    },
  },

  // Financials
  financial: {
    title: "כספים",
    quotes: "הצעות מחיר",
    invoices: "חשבוניות",
    expenses: "הוצאות",
    newQuote: "הצעת מחיר חדשה",
    newInvoice: "חשבונית חדשה",
    newExpense: "הוצאה חדשה",
    subtotal: "סכום ביניים",
    tax: 'מע"מ (17%)',
    total: 'סה"כ',
    status: "סטטוס",
    quoteStatuses: {
      draft: "טיוטה",
      sent: "נשלחה",
      accepted: "אושרה",
      declined: "נדחתה",
    },
    invoiceStatuses: {
      draft: "טיוטה",
      sent: "נשלחה",
      paid: "שולמה",
      overdue: "באיחור",
      cancelled: "בוטלה",
    },
    expenseCategories: {
      overhead: "הוצאה חודשית קבועה",
      project: "הוצאה לפרויקט",
      gear_purchase: "רכישת ציוד",
      vehicle_travel: "רכב/נסיעות",
      other: "אחר",
    },
  },

  // Content Calendar
  calendar: {
    title: "לוח תוכן",
    newContent: "תוכן חדש",
    contentTypes: {
      client_shoot: "צילום לקוח",
      youtube_long: "יוטיוב ארוך",
      short_form: "קצר",
    },
    statuses: {
      planned: "מתוכנן",
      editing: "בעריכה",
      ready: "מוכן לפרסום",
      published: "פורסם",
    },
    noContent: "אין תוכן מתוכנן",
    upcomingContent: "תוכן וצילומים קרובים",
  },

  // Contacts / Crew Rolodex
  contacts: {
    title: "אנשי קשר",
    newContact: "איש קשר חדש",
    categories: {
      editor: "עורך",
      stills_photographer: "צלם סטילס",
      video_photographer: "צלם וידאו",
      lighting: "תאורן",
      director: "במאי",
      art: "ארט",
      production_assistant: "עוזר הפקה",
      producer: "מפיק",
      three_d: "תלת מימד",
      sound_designer: "מעצב סאונד",
      makeup: "איפור",
      actor: "שחקן/ית",
      rental_house: "השכרת ציוד",
      studio: "סטודיו",
      social_manager: "מנהל/ת סושיאל",
    },
  },

  // Subscriptions
  subscriptions: {
    title: "הוצאות חודשיות",
    newSubscription: "מנוי חדש",
    totalMonthly: "עלות חודשית כוללת",
    cycles: {
      monthly: "חודשי",
      yearly: "שנתי",
    },
    statuses: {
      active: "פעיל",
      cancelled: "בוטל",
    },
  },

  // Travel Log
  travelLog: {
    title: "יומן נסיעות",
    newEntry: "נסיעה חדשה",
    totalKm: "סה״כ ק״מ החודש",
    origin: "מוצא",
    destination: "יעד",
    kilometers: "ק״מ",
  },

  // Asset Library
  assets: {
    title: "רישיונות",
    newAsset: "נכס חדש",
    types: {
      music: "מוזיקה",
      sfx: "אפקטים קוליים",
      font: "פונט",
      stock_footage: "סטוק וידאו",
    },
  },

  // Inspiration Board
  inspiration: {
    title: "לוח השראה",
    newItem: "השראה חדשה",
    categories: {
      lighting: "תאורה",
      editing: "עריכה",
      hooks: "הוקים",
      thumbnails: "תמונות ממוזערות",
    },
  },

  // Cheat Sheets
  cheatSheets: {
    title: "מדריכים ונהלים",
    newSheet: "מדריך חדש",
  },

  // Scripts
  scripts: {
    title: "תסריטים",
    newScript: "תסריט חדש",
    untitled: "תסריט ללא כותרת",
    editor: {
      placeholder: "התחל לכתוב את התסריט שלך...",
      saving: "שומר...",
      saved: "נשמר",
      unsaved: "לא נשמר",
    },
    ai: {
      title: "AI Copilot",
      generateTab: "צור",
      upgradeTab: "שדרג",
      instructTab: "הוראות",
      generatePlaceholder: "תאר את התסריט שאתה רוצה (נושא, אורך, פלטפורמה)...",
      instructPlaceholder: "ספר ל-AI מה לשנות...",
      generateButton: "צור תסריט",
      upgradeButton: "שדרג תסריט",
      applyButton: "החל",
      generating: "יוצר...",
      upgrading: "משדרג...",
      applying: "מחיל...",
    },
    noScripts: "אין תסריטים עדיין",
    deleteConfirm: "האם למחוק את התסריט?",
  },

  // Dashboard Widgets
  widgets: {
    quickNotes: "פתקים מהירים",
    quickNotesPlaceholder: "רשום רעיונות כאן...",
    todos: "משימות יומיות",
    todosPlaceholder: "הוסף משימה...",
    quickLinks: "קישורים מהירים",
    newLink: "קישור חדש",
    gearReset: "סטטוס ציוד",
    gearItems: {
      sd_cards: "כרטיסי SD",
      footage: "גיבוי חומרים",
      batteries: "סוללות",
    },
    gearReady: "מוכן",
    gearNotReady: "דורש טיפול",
  },

  // Common
  common: {
    save: "שמור",
    cancel: "ביטול",
    delete: "מחק",
    edit: "ערוך",
    add: "הוסף",
    search: "חיפוש",
    filter: "סינון",
    noResults: "לא נמצאו תוצאות",
    loading: "טוען...",
    currency: "₪",
  },
} as const;
