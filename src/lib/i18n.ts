import { notFound } from "next/navigation";

export const locales = ["en", "sw"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function requireLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export const messages = {
  en: {
    brand: "SokoPilot",
    tagline: "Every customer question, met with a better answer.",
    intro:
      "A thoughtful WhatsApp sales assistant for fashion and beauty merchants. Help customers find the right product with answers grounded in your catalogue—and keep your team in control.",
    signIn: "Open the demo",
    signInTitle: "Welcome to SokoPilot",
    signInDescription:
      "Enter the shared demo code to explore a calmer way to handle product questions.",
    accessCode: "Demo access code",
    enterDemo: "Enter workspace",
    checkingCode: "Checking code…",
    gateNotConfigured:
      "Demo access isn't set up yet. Please ask the demo team to configure it.",
    invalidCode: "That code doesn't look right. Please try again.",
    dashboard: "Overview",
    conversations: "Conversations",
    products: "Product catalogue",
    settings: "Assistant setup",
    privacy: "Privacy",
    recovery: "Access help",
    signOut: "Exit demo",
    welcome: "Good to see you",
    dashboardDescription:
      "A clear view of your customer conversations and product catalogue.",
    conversationsDescription:
      "A shared place for customer questions, helpful answers, and moments that need your attention.",
    productsDescription:
      "Keep product details in one place so recommendations can stay accurate and up to date.",
    addProduct: "Add a product",
    addProductDescription:
      "Save catalogue facts here. Recommendations should use current product and variant data only.",
    productName: "Product name",
    category: "Category",
    variantLabel: "Variant label",
    size: "Size",
    color: "Color",
    price: "Price",
    currency: "Currency",
    stockQuantity: "Stock quantity",
    description: "Description",
    saveProduct: "Save product",
    saving: "Saving…",
    updateStock: "Update stock",
    productCreated: "Product saved to the catalogue.",
    stockUpdated: "Stock quantity updated.",
    invalidProductInput: "Check the product details and try again.",
    productNotFound: "That product variant could not be found in this workspace.",
    databaseNotConfigured:
      "The demo database is not configured. Set DATABASE_URL for the approved development database.",
    demoDataNotSeeded:
      "The synthetic demo workspace has not been seeded. Follow the setup runbook for the dedicated demo database.",
    databaseWritesNotApproved:
      "Database writes are disabled until you explicitly approve a dedicated demo database.",
    demoAccessExpired: "Your demo access expired. Please unlock the demo again.",
    storageUnavailable:
      "The demo catalogue could not be loaded or saved. Check the database setup and server logs.",
    catalogueProducts: "Catalogue products",
    productActive: "Active",
    productDraft: "Draft",
    productArchived: "Archived",
    catalogueSourceNote:
      "Values below are read from the demo database and are the source for catalogue recommendations.",
    noVariants: "No variants have been added to this product.",
    defaultVariant: "Standard",
    noVariantDetails: "No size or color specified",
    inStock: "In stock",
    outOfStock: "Unavailable",
    conversationsUnavailable:
      "Conversations are unavailable until a verified WhatsApp message is stored.",
    handoff: "Take over",
    resumeAutomation: "Resume assistant",
    handoffActive: "Merchant has control",
    assistantActive: "Assistant active",
    customer: "Customer",
    latestMessage: "Latest message",
    noConversationMessages: "No message content was stored.",
    databaseSetupNeeded: "Database setup needed",
    webhookSetupNeeded: "WhatsApp webhook setup needed",
    modelSetupNeeded: "Meta model setup needed",
    configured: "Configured",
    notConfigured: "Not configured",
    setupBlockerNote:
      "Readiness checks only confirm server configuration is present; they do not prove a live connection or successful provider call.",
    assistantEnabled: "Assistant enabled",
    assistantDisabled: "Assistant paused",
    assistantConfiguration: "Current assistant configuration",
    assistantStatus: "Status",
    modelIdentifier: "Configured model identifier",
    enabledTools: "Enabled tools",
    modelPathUnavailable:
      "The Meta model request path is not implemented; assistant automation remains disabled.",
    inboxSourceNote:
      "Inbound messages are stored after webhook verification. Automation remains paused because the Meta model request path is not implemented.",
    conversationNotFound: "That conversation could not be found in this demo workspace.",
    invalidConversationAction: "This conversation action is invalid. Refresh and try again.",
    demoReadiness: "Demo readiness",
    customerOptedOut: "Customer opted out",
    assistantUnavailable: "Assistant not connected",
    manualReply: "Write a WhatsApp reply",
    sending: "Sending…",
    sendReply: "Send reply",
    replySent: "Reply sent and saved to the conversation.",
    whatsappReplyNotConfigured:
      "WhatsApp sending is not ready. Check the connected test number, Graph API version, token encryption key, and database.",
    whatsappProviderFailed:
      "WhatsApp did not confirm the reply. Check provider status before trying again.",
    whatsappSentNotSaved:
      "WhatsApp accepted the reply, but it could not be saved here. Check the conversation before retrying.",
    replyRequiresHandoff: "Take over the conversation before sending a manual reply.",
    settingsDescription:
      "Connect your channels and choose how your assistant supports your customers.",
    privacyDescription:
      "Your customers' conversations should be handled with care. SokoPilot is designed to use conversation and catalogue data only to support the merchant's customer service.",
    recoveryDescription:
      "Ask the demo team for the shared access code. This temporary code is not an individual user account.",
    securityNote:
      "This shared access code is for the private demo only—not a production sign-in.",
    demoWorkspace: "Demo workspace",
    navWorkspace: "WORKSPACE",
    navManage: "MANAGE",
    workspaceName: "Atelier Nia",
    workspaceType: "Fashion & beauty",
    statusNotConnected: "Not connected",
    workspacePreview: "Preview workspace",
    previewNote: "Sample workspace · no live customer data",
    overviewEyebrow: "YOUR SHOP, AT A GLANCE",
    overviewTitle: "A little more room to focus on your customers.",
    overviewIntro:
      "When your channels are connected, your most important customer conversations will be right here.",
    metricConversations: "Open conversations",
    metricProducts: "Products in catalogue",
    metricResponse: "Typical first reply",
    metricResolution: "Needs your attention",
    noData: "—",
    metricUnavailable: "Available after setup",
    currentRecords: "Current demo records",
    activityTitle: "Recent conversations",
    activityEmptyTitle: "Your inbox is ready when you are",
    activityEmpty:
      "Connect WhatsApp to bring customer questions into one calm, organized view.",
    connectWhatsApp: "Set up WhatsApp",
    quickActionsTitle: "Make this workspace yours",
    quickActionProducts: "Prepare your catalogue",
    quickActionProductsBody:
      "Add accurate prices, variants, and stock before your assistant makes recommendations.",
    quickActionAssistant: "Set up your assistant",
    quickActionAssistantBody:
      "Choose the tools it can use and when it should bring you into the conversation.",
    viewCatalogue: "View catalogue",
    configureAssistant: "Configure assistant",
    connectedChannel: "CHANNEL",
    catalogueStatus: "CATALOGUE",
    noProductsYet: "Ready for your first product",
    noProductsBody:
      "Your product catalogue will appear here once connected. Keep prices and stock up to date for grounded recommendations.",
    productsEmptyLabel: "Catalogue preview",
    conversationEmptyLabel: "Your inbox",
    conversationEmptyTitle: "A quieter inbox starts here",
    conversationEmptyBody:
      "Once WhatsApp is connected, customer messages and assistant replies will appear in this space.",
    conversationEmptyHint: "Your inbox is currently disconnected.",
    setupTitle: "A considered setup, before the first reply.",
    setupIntro:
      "Connect your customer channel and choose the boundaries your assistant should follow.",
    setupChannelTitle: "WhatsApp Business",
    setupChannelBody:
      "Connect a test number to receive customer questions and send replies.",
    setupModelTitle: "Meta model",
    setupModelBody:
      "Choose and verify the exact Meta model used for customer conversations.",
    setupSafetyTitle: "Merchant in control",
    setupSafetyBody:
      "Review which tools are enabled and when a conversation should come to you.",
    setupNotConfigured: "Not configured",
    setupSafetyReady: "Always on",
    previewBadge: "PRIVATE DEMO",
    privacyTitle: "Built with care for customer conversations.",
    privacyPointData: "Keep business data in the merchant workspace.",
    privacyPointControl: "Keep the merchant in control of assistant actions.",
    privacyPointClear:
      "Be clear about what is configured, measured, and still a preview.",
    recoveryTitle: "Need access to the demo?",
    recoveryAction:
      "Reach out to the person who invited you and ask for the shared demo code.",
    previewStrip: "A clearer way to care for every customer",
    featureGrounded: "Answers grounded in your catalogue",
    featureControl: "Your team stays in control",
    featureBilingual: "Made for English and Swahili",
    featureLabel: "A better kind of busy",
    featureTitle: "More helpful replies. More time for the work only you can do.",
    featureBody:
      "Give your team a thoughtful starting point for product questions, without handing over the customer relationship.",
    previewTitle: "A customer asks",
    previewQuestion: "“Do you have this in a smaller size?”",
    previewReply:
      "“I can help with that. Which style are you looking at? I’ll check the available sizes for you.”",
    previewReplyLabel: "A helpful first reply",
    previewFootnote: "Illustrative conversation · not a live customer",
    getStarted: "Explore the private demo",
    learnMore: "How it works",
    footerTagline: "Thoughtful commerce, one conversation at a time.",
    navigationLabel: "Main navigation",
    switchToLightTheme: "Switch to light theme",
    switchToDarkTheme: "Switch to dark theme",
    switchToEnglish: "Switch language to English",
    switchToSwahili: "Switch language to Swahili",
    mobileMenuLabel: "Workspace navigation",
  },
  sw: {
    brand: "SokoPilot",
    tagline: "Kila swali la mteja, lijibiwe kwa umakini zaidi.",
    intro:
      "Msaidizi wa mauzo wa WhatsApp kwa wafanyabiashara wa mitindo na urembo. Wasaidie wateja kupata bidhaa sahihi kwa majibu yanayotegemea katalogi yako—na timu yako ibaki na udhibiti.",
    signIn: "Fungua onyesho",
    signInTitle: "Karibu SokoPilot",
    signInDescription:
      "Weka msimbo wa pamoja wa onyesho ili kuchunguza njia tulivu zaidi ya kushughulikia maswali ya bidhaa.",
    accessCode: "Msimbo wa ufikiaji wa onyesho",
    enterDemo: "Ingia kwenye eneo la kazi",
    checkingCode: "Inakagua msimbo…",
    gateNotConfigured:
      "Ufikiaji wa onyesho bado haujawekwa. Tafadhali iombe timu ya onyesho isanidi.",
    invalidCode: "Msimbo huo hauonekani kuwa sahihi. Tafadhali jaribu tena.",
    dashboard: "Muhtasari",
    conversations: "Mazungumzo",
    products: "Katalogi ya bidhaa",
    settings: "Mipangilio ya msaidizi",
    privacy: "Faragha",
    recovery: "Msaada wa ufikiaji",
    signOut: "Toka kwenye onyesho",
    welcome: "Tunafurahi kukuona",
    dashboardDescription:
      "Muhtasari wa mazungumzo ya wateja na katalogi ya bidhaa zako.",
    conversationsDescription:
      "Mahali pamoja pa maswali ya wateja, majibu yenye msaada, na mambo yanayohitaji uangalizi wako.",
    productsDescription:
      "Weka maelezo ya bidhaa pamoja ili mapendekezo yawe sahihi na ya sasa.",
    addProduct: "Ongeza bidhaa",
    addProductDescription:
      "Hifadhi ukweli wa katalogi hapa. Mapendekezo yatumie tu taarifa za sasa za bidhaa na matoleo.",
    productName: "Jina la bidhaa",
    category: "Aina",
    variantLabel: "Jina la toleo",
    size: "Saizi",
    color: "Rangi",
    price: "Bei",
    currency: "Sarafu",
    stockQuantity: "Idadi ya stoku",
    description: "Maelezo",
    saveProduct: "Hifadhi bidhaa",
    saving: "Inahifadhi…",
    updateStock: "Sasisha stoku",
    productCreated: "Bidhaa imehifadhiwa kwenye katalogi.",
    stockUpdated: "Idadi ya stoku imesasishwa.",
    invalidProductInput: "Kagua maelezo ya bidhaa kisha ujaribu tena.",
    productNotFound: "Toleo hilo la bidhaa halijapatikana katika eneo hili la kazi.",
    databaseNotConfigured:
      "Hifadhidata ya onyesho haijawekwa. Weka DATABASE_URL ya hifadhidata ya maendeleo iliyoidhinishwa.",
    demoDataNotSeeded:
      "Eneo la mfano halijaandaliwa. Fuata mwongozo wa usanidi wa hifadhidata maalum ya onyesho.",
    databaseWritesNotApproved:
      "Uandishi kwenye hifadhidata umezimwa hadi uidhinishe wazi hifadhidata maalum ya onyesho.",
    demoAccessExpired: "Muda wa ufikiaji wa onyesho umeisha. Fungua onyesho tena.",
    storageUnavailable:
      "Katalogi ya onyesho haikuweza kusomwa au kuhifadhiwa. Kagua usanidi wa hifadhidata na kumbukumbu za seva.",
    catalogueProducts: "Bidhaa za katalogi",
    productActive: "Inatumika",
    productDraft: "Rasimu",
    productArchived: "Imehifadhiwa",
    catalogueSourceNote:
      "Taarifa hapa zinasomwa kutoka hifadhidata ya onyesho na ndizo chanzo cha mapendekezo.",
    noVariants: "Hakuna matoleo yaliyoongezwa kwa bidhaa hii.",
    defaultVariant: "Kawaida",
    noVariantDetails: "Hakuna saizi au rangi iliyobainishwa",
    inStock: "Ipo stoku",
    outOfStock: "Haipatikani",
    conversationsUnavailable:
      "Mazungumzo hayapatikani hadi ujumbe wa WhatsApp uliothibitishwa uhifadhiwe.",
    handoff: "Chukua udhibiti",
    resumeAutomation: "Washa msaidizi tena",
    handoffActive: "Mfanyabiashara ana udhibiti",
    assistantActive: "Msaidizi anafanya kazi",
    customer: "Mteja",
    latestMessage: "Ujumbe wa karibuni",
    noConversationMessages: "Maudhui ya ujumbe hayakuhifadhiwa.",
    databaseSetupNeeded: "Hifadhidata inahitaji usanidi",
    webhookSetupNeeded: "Webhook ya WhatsApp inahitaji usanidi",
    modelSetupNeeded: "Modeli ya Meta inahitaji usanidi",
    configured: "Imesanidiwa",
    notConfigured: "Haijasanidiwa",
    setupBlockerNote:
      "Ukaguzi huu huthibitisha tu kuwa usanidi wa seva upo; hauthibitishi muunganisho au mwito wa modeli uliofanikiwa.",
    assistantEnabled: "Msaidizi amewashwa",
    assistantDisabled: "Msaidizi amesimamishwa",
    assistantConfiguration: "Mipangilio ya sasa ya msaidizi",
    assistantStatus: "Hali",
    modelIdentifier: "Kitambulisho cha modeli kilichosanidiwa",
    enabledTools: "Zana zilizowashwa",
    modelPathUnavailable:
      "Njia ya mwito wa modeli ya Meta haijatekelezwa; uendeshaji wa msaidizi umezimwa.",
    inboxSourceNote:
      "Ujumbe unaoingia huhifadhiwa baada ya uthibitishaji wa webhook. Msaidizi amesimamishwa kwa sababu njia ya mwito wa modeli ya Meta bado haijatekelezwa.",
    conversationNotFound: "Mazungumzo hayo hayakupatikana katika eneo hili la onyesho.",
    invalidConversationAction: "Kitendo hiki cha mazungumzo si sahihi. Onyesha upya kisha ujaribu tena.",
    demoReadiness: "Utayari wa onyesho",
    customerOptedOut: "Mteja amejiondoa",
    assistantUnavailable: "Msaidizi hajaunganishwa",
    manualReply: "Andika jibu la WhatsApp",
    sending: "Inatuma…",
    sendReply: "Tuma jibu",
    replySent: "Jibu limetumwa na kuhifadhiwa kwenye mazungumzo.",
    whatsappReplyNotConfigured:
      "Utumaji wa WhatsApp hauko tayari. Kagua nambari ya majaribio, toleo la Graph API, ufunguo wa usimbaji wa tokeni na hifadhidata.",
    whatsappProviderFailed:
      "WhatsApp haijathibitisha jibu. Kagua hali ya mtoa huduma kabla ya kujaribu tena.",
    whatsappSentNotSaved:
      "WhatsApp imekubali jibu lakini halikuweza kuhifadhiwa hapa. Kagua mazungumzo kabla ya kutuma tena.",
    replyRequiresHandoff: "Chukua udhibiti wa mazungumzo kabla ya kutuma jibu.",
    settingsDescription:
      "Unganisha njia zako za mawasiliano na uchague jinsi msaidizi atakavyowahudumia wateja.",
    privacyDescription:
      "Mazungumzo ya wateja wako yanapaswa kushughulikiwa kwa uangalifu. SokoPilot imeundwa kutumia data ya mazungumzo na katalogi kusaidia huduma kwa wateja pekee.",
    recoveryDescription:
      "Omba msimbo wa pamoja kutoka kwa timu ya onyesho. Msimbo huu wa muda si akaunti binafsi ya mtumiaji.",
    securityNote:
      "Msimbo huu wa pamoja ni wa onyesho la faragha tu—si njia ya kuingia kwa uzalishaji.",
    demoWorkspace: "Eneo la onyesho",
    navWorkspace: "ENEO LA KAZI",
    navManage: "USIMAMIZI",
    workspaceName: "Atelier Nia",
    workspaceType: "Mitindo na urembo",
    statusNotConnected: "Haijaunganishwa",
    workspacePreview: "Eneo la onyesho",
    previewNote: "Eneo la mfano · hakuna data halisi ya wateja",
    overviewEyebrow: "MUHTASARI WA DUKA LAKO",
    overviewTitle: "Pata nafasi zaidi ya kuwajali wateja wako.",
    overviewIntro:
      "Baada ya kuunganisha njia zako, mazungumzo muhimu zaidi ya wateja yataonekana hapa.",
    metricConversations: "Mazungumzo wazi",
    metricProducts: "Bidhaa kwenye katalogi",
    metricResponse: "Muda wa jibu la kwanza",
    metricResolution: "Yanayohitaji uangalizi",
    noData: "—",
    metricUnavailable: "Itapatikana baada ya usanidi",
    currentRecords: "Rekodi za sasa za onyesho",
    activityTitle: "Mazungumzo ya hivi karibuni",
    activityEmptyTitle: "Kikasha chako kiko tayari",
    activityEmpty:
      "Unganisha WhatsApp ili kuona maswali ya wateja katika sehemu moja iliyopangwa.",
    connectWhatsApp: "Sanidi WhatsApp",
    quickActionsTitle: "Fanya eneo hili liwe lako",
    quickActionProducts: "Andaa katalogi yako",
    quickActionProductsBody:
      "Ongeza bei, matoleo na stoku sahihi kabla ya msaidizi kutoa mapendekezo.",
    quickActionAssistant: "Sanidi msaidizi wako",
    quickActionAssistantBody:
      "Chagua zana anazoweza kutumia na wakati wa kukupa mazungumzo.",
    viewCatalogue: "Tazama katalogi",
    configureAssistant: "Sanidi msaidizi",
    connectedChannel: "NJIA YA MAWASILIANO",
    catalogueStatus: "KATALOGI",
    noProductsYet: "Tayari kwa bidhaa yako ya kwanza",
    noProductsBody:
      "Katalogi yako itaonekana hapa ikiunganishwa. Weka bei na stoku za sasa ili mapendekezo yawe sahihi.",
    productsEmptyLabel: "Onyesho la katalogi",
    conversationEmptyLabel: "Kikasha chako",
    conversationEmptyTitle: "Kikasha tulivu kinaanzia hapa",
    conversationEmptyBody:
      "Baada ya kuunganisha WhatsApp, ujumbe wa wateja na majibu ya msaidizi yataonekana hapa.",
    conversationEmptyHint: "Kikasha chako hakijaunganishwa kwa sasa.",
    setupTitle: "Usanidi makini kabla ya jibu la kwanza.",
    setupIntro:
      "Unganisha njia ya mawasiliano na uchague mipaka ambayo msaidizi anapaswa kufuata.",
    setupChannelTitle: "WhatsApp Business",
    setupChannelBody:
      "Unganisha nambari ya majaribio ili kupokea maswali na kutuma majibu.",
    setupModelTitle: "Modeli ya Meta",
    setupModelBody:
      "Chagua na uthibitishe modeli halisi ya Meta itakayotumika kwenye mazungumzo.",
    setupSafetyTitle: "Mfanyabiashara ana udhibiti",
    setupSafetyBody:
      "Kagua zana zilizowezeshwa na wakati mazungumzo yanapaswa kukufikia.",
    setupNotConfigured: "Haijasanidiwa",
    setupSafetyReady: "Huwashwa kila wakati",
    previewBadge: "ONYESHO LA FARAGHA",
    privacyTitle: "Imeundwa kwa uangalifu wa mazungumzo ya wateja.",
    privacyPointData: "Hifadhi data ya biashara katika eneo la mfanyabiashara.",
    privacyPointControl: "Mfanyabiashara adhibiti vitendo vya msaidizi.",
    privacyPointClear:
      "Eleza wazi kilichosanidiwa, kilichopimwa, na kilicho onyesho tu.",
    recoveryTitle: "Unahitaji kuingia kwenye onyesho?",
    recoveryAction:
      "Wasiliana na aliyekualika na uombe msimbo wa pamoja wa onyesho.",
    previewStrip: "Njia yenye umakini zaidi ya kumjali kila mteja",
    featureGrounded: "Majibu yanayotegemea katalogi yako",
    featureControl: "Timu yako inaendelea kuwa na udhibiti",
    featureBilingual: "Imeundwa kwa Kiingereza na Kiswahili",
    featureLabel: "Biashara yenye utulivu zaidi",
    featureTitle:
      "Majibu yenye msaada zaidi. Muda zaidi kwa kazi zinazohitaji wewe.",
    featureBody:
      "Ipe timu yako mwanzo mzuri wa kujibu maswali ya bidhaa bila kupoteza uhusiano na mteja.",
    previewTitle: "Mteja anauliza",
    previewQuestion: "“Je, mnayo hii ya saizi ndogo?”",
    previewReply:
      "“Naweza kusaidia. Unatafuta mtindo gani? Nitakukagua saizi zilizopo.”",
    previewReplyLabel: "Jibu la kwanza lenye msaada",
    previewFootnote: "Mfano wa mazungumzo · si mteja halisi",
    getStarted: "Chunguza onyesho la faragha",
    learnMore: "Jinsi inavyofanya kazi",
    footerTagline: "Biashara yenye umakini, mazungumzo moja baada ya jingine.",
    navigationLabel: "Urambazaji mkuu",
    switchToLightTheme: "Badilisha kwenda mandhari angavu",
    switchToDarkTheme: "Badilisha kwenda mandhari meusi",
    switchToEnglish: "Badilisha lugha iwe Kiingereza",
    switchToSwahili: "Badilisha lugha iwe Kiswahili",
    mobileMenuLabel: "Urambazaji wa eneo la kazi",
  },
} satisfies Record<Locale, Record<string, string>>;
