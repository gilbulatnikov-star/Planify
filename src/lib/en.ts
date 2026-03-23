// English labels for the entire app
export const en = {
  // Navigation
  nav: {
    dashboard: "Dashboard",
    projects: "Projects",
    clients: "Clients",
    equipment: "Equipment",
    financials: "Financials",
    calendar: "Content Calendar",
    contacts: "Contacts",
    subscriptions: "Subscriptions",
    travelLog: "Travel Log",
    assets: "Licenses",
    inspiration: "Inspiration",
    cheatSheets: "Guides",
    scripts: "Scripts",
    moodboard: "Moodboard",
    billing: "Billing",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    activeProjects: "Active Projects",
    upcomingShoots: "Upcoming Events",
    pendingDeadlines: "Pending Deadlines",
    monthlyRevenue: "Monthly Revenue",
    outstandingInvoices: "Outstanding Invoices",
    conversionRate: "Conversion Rate",
    recentProjects: "Recent Projects",
    recentClients: "Recent Clients",
    noProjects: "No active projects",
    noShoots: "No upcoming events",
  },

  // Projects
  project: {
    title: "Projects",
    newProject: "New Project",
    phases: {
      // Legacy
      pre_production:    "Pre-Production",
      production:        "Production",
      post_production:   "Post-Production",
      delivered:         "Delivered",
      revisions:         "Revisions",
      // Photography
      coordination:      "Coordination",
      shoot_day:         "Shoot Day",
      shoot_days:        "Shoot Days",
      selection:         "Selection",
      editing:           "Editing",
      gallery_delivery:  "Gallery Delivery",
      // Video / Content
      brief:             "Brief",
      planning:          "Planning",
      monthly_planning:  "Monthly Planning",
      research:          "Research",
      recording:         "Recording",
      writing:           "Writing",
      graphics:          "Graphics",
      waiting_approval:  "Waiting for Approval",
      published:         "Published",
      scheduling:        "Scheduling",
      active:            "Active",
      // Editing
      materials_received: "Materials Received",
      first_cut:          "First Cut",
      draft:              "Draft",
    },
    statuses: {
      pitching:       "Pitching",
      scripting:      "Scripting",
      moodboards:     "Moodboarding",
      location_scouting: "Location Scouting",
      scheduled:      "Scheduled",
      shooting:       "Shooting",
      wrapping:       "Wrapping Up",
      ingest_sync:    "Ingesting",
      rough_cut:      "Rough Cut",
      revisions_v1:   "Revision 1",
      revisions_v2:   "Revision 2",
      color_sound:    "Color & Sound",
      final_delivery: "Final Delivery",
      delivered:      "Delivered",
      archived:       "Archived",
    },
    types: {
      // Legacy
      youtube:     "YouTube Video",
      music_video: "Music Video",
      commercial:  "Commercial",
      corporate:   "Corporate",
      social:      "Social Media",
      // Photography
      wedding:             "Wedding",
      bar_bat_mitzva:      "Bar / Bat Mitzvah",
      event_photo:         "Event",
      portrait:            "Portrait / Mini Session",
      product_photography: "Product Photography",
      real_estate:         "Real Estate",
      fashion:             "Fashion",
      family:              "Family / Maternity",
      // Video
      podcast:   "Podcast",
      interview: "Interview",
      bts:       "BTS",
      // Content
      reel:             "Reel / Story",
      post_carousel:    "Post / Carousel",
      page_management:  "Page Management (Retainer)",
      content_strategy: "Content Strategy",
      // Editing
      video_editing:   "Video Editing",
      podcast_editing: "Podcast Editing",
      motion_graphics: "Motion Graphics",
    },
    shootDate: "Date",
    deadline:  "Deadline",
    budget:    "Budget",
    client:    "Client",
    description: "Description",
    type: "Project Type",
  },

  // Clients
  client: {
    title: "Clients",
    newClient: "New Client",
    newLead: "New Lead",
    name: "Name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    notes: "Notes",
    type: "Type",
    types: {
      lead: "Lead",
      client: "Client",
    },
    leadSource: "Lead Source",
    leadSources: {
      linkedin: "LinkedIn",
      organic: "Organic",
      referral: "Referral",
      website: "Website",
      social: "Social Media",
      other: "Other",
    },
    leadStatus: "Lead Status",
    leadStatuses: {
      new: "New",
      contacted: "Contacted",
      qualified: "Qualified",
      proposal_sent: "Proposal Sent",
      won: "Won",
      lost: "Lost",
    },
    interactions: "Interaction History",
    interactionTypes: {
      call: "Call",
      email: "Email",
      meeting: "Meeting",
      note: "Note",
    },
  },

  // Equipment
  equipment: {
    title: "Equipment",
    newItem: "New Item",
    name: "Name",
    category: "Category",
    brand: "Brand",
    model: "Model",
    serialNumber: "Serial Number",
    purchasePrice: "Purchase Price",
    status: "Status",
    categories: {
      camera: "Camera",
      lens: "Lens",
      drone: "Drone",
      lighting: "Lighting",
      audio: "Audio",
      grip: "Grip",
      other: "Other",
    },
    statuses: {
      available: "Available",
      rented: "Rented",
      in_repair: "In Repair",
      retired: "Retired",
    },
  },

  // Financials
  financial: {
    title: "Financials",
    quotes: "Quotes",
    invoices: "Invoices",
    expenses: "Expenses",
    newQuote: "New Quote",
    newInvoice: "New Invoice",
    newExpense: "New Expense",
    subtotal: "Subtotal",
    tax: "VAT (17%)",
    total: "Total",
    status: "Status",
    quoteStatuses: {
      draft: "Draft",
      sent: "Sent",
      accepted: "Accepted",
      declined: "Declined",
    },
    invoiceStatuses: {
      draft: "Draft",
      sent: "Sent",
      paid: "Paid",
      overdue: "Overdue",
      cancelled: "Cancelled",
    },
    expenseCategories: {
      overhead: "Overhead",
      project: "Project Expense",
      gear_purchase: "Gear Purchase",
      vehicle_travel: "Vehicle / Travel",
      other: "Other",
    },
  },

  // Content Calendar
  calendar: {
    title: "Content Calendar",
    newContent: "New Content",
    contentTypes: {
      client_shoot: "Client Shoot",
      youtube_long: "YouTube Long",
      short_form: "Short Form",
    },
    statuses: {
      planned: "Planned",
      editing: "Editing",
      ready: "Ready to Publish",
      published: "Published",
    },
    noContent: "No content planned",
    upcomingContent: "Upcoming Content & Shoots",
  },

  // Contacts / Crew Rolodex
  contacts: {
    title: "Contacts",
    newContact: "New Contact",
    categories: {
      editor: "Editor",
      stills_photographer: "Stills Photographer",
      video_photographer: "Video Photographer",
      lighting: "Lighting",
      director: "Director",
      art: "Art",
      production_assistant: "Production Assistant",
      producer: "Producer",
      three_d: "3D",
      sound_designer: "Sound Designer",
      makeup: "Makeup",
      actor: "Actor",
      rental_house: "Rental House",
      studio: "Studio",
      social_manager: "Social Manager",
    },
  },

  // Subscriptions
  subscriptions: {
    title: "Monthly Subscriptions",
    newSubscription: "New Subscription",
    totalMonthly: "Total Monthly Cost",
    cycles: {
      monthly: "Monthly",
      yearly: "Yearly",
    },
    statuses: {
      active: "Active",
      cancelled: "Cancelled",
    },
  },

  // Travel Log
  travelLog: {
    title: "Travel Log",
    newEntry: "New Trip",
    totalKm: "Total km this month",
    origin: "Origin",
    destination: "Destination",
    kilometers: "km",
  },

  // Asset Library
  assets: {
    title: "Licenses",
    newAsset: "New Asset",
    types: {
      music: "Music",
      sfx: "Sound Effects",
      font: "Font",
      stock_footage: "Stock Footage",
    },
  },

  // Inspiration Board
  inspiration: {
    title: "Inspiration Board",
    newItem: "New Inspiration",
    categories: {
      lighting: "Lighting",
      editing: "Editing",
      hooks: "Hooks",
      thumbnails: "Thumbnails",
    },
  },

  // Cheat Sheets
  cheatSheets: {
    title: "Guides & SOPs",
    newSheet: "New Guide",
  },

  // Scripts
  scripts: {
    title: "Scripts",
    newScript: "New Script",
    untitled: "Untitled Script",
    editor: {
      placeholder: "Start writing your script...",
      saving: "Saving...",
      saved: "Saved",
      unsaved: "Unsaved",
    },
    ai: {
      title: "AI Copilot",
      generateTab: "Generate",
      upgradeTab: "Upgrade",
      instructTab: "Instructions",
      generatePlaceholder: "Describe the script you want (topic, length, platform)...",
      instructPlaceholder: "Tell the AI what to change...",
      generateButton: "Generate Script",
      upgradeButton: "Upgrade Script",
      applyButton: "Apply",
      generating: "Generating...",
      upgrading: "Upgrading...",
      applying: "Applying...",
    },
    noScripts: "No scripts yet",
    deleteConfirm: "Delete this script?",
  },

  // Dashboard Widgets
  widgets: {
    quickNotes: "Quick Notes",
    quickNotesPlaceholder: "Write ideas here...",
    todos: "Daily Tasks",
    todosPlaceholder: "Add a task...",
    quickLinks: "Quick Links",
    newLink: "New Link",
    gearReset: "Gear Status",
    gearItems: {
      sd_cards: "SD Cards",
      footage: "Footage Backup",
      batteries: "Batteries",
    },
    gearReady: "Ready",
    gearNotReady: "Needs Attention",
  },

  // Common
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    noResults: "No results found",
    loading: "Loading...",
    currency: "₪",
  },
} as const;
