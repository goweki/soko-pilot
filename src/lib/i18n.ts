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
    tagline: "Every product detail. Every customer conversation. One place.",
    intro:
      "A clear view of products and WhatsApp conversations for fashion and beauty merchants. Keep prices and stock current, bring every customer question into one inbox, and keep your team in control.",
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
      "A shared inbox for customer questions, team replies, and conversations that need your attention.",
    productsDescription:
      "Keep prices, variants, and stock current so every customer answer starts from reliable product facts.",
    addProduct: "Add a product",
    addProductDescription:
      "Save product facts in the database so your team can answer from current catalogue records.",
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
    productNotFound:
      "That product variant could not be found in this workspace.",
    databaseNotConfigured:
      "The demo database is not configured. Set DATABASE_URL for the configured demo database.",
    demoDataNotSeeded:
      "The synthetic demo workspace has not been seeded. Follow the setup runbook for the dedicated demo database.",
    databaseWritesNotApproved:
      "Database writes are disabled until you explicitly approve a dedicated demo database.",
    demoAccessExpired:
      "Your demo access expired. Please unlock the demo again.",
    storageUnavailable:
      "The demo catalogue could not be loaded or saved. Check the database setup and server logs.",
    catalogueProducts: "Catalogue products",
    catalogueUnavailable:
      "Live catalogue preview is unavailable until the database is configured.",
    productActive: "Active",
    productDraft: "Draft",
    productArchived: "Archived",
    catalogueSourceNote:
      "Values below are read from the configured demo database.",
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
    handoffSince: "Handoff since",
    conversationOpen: "Open",
    conversationHandoff: "Handoff",
    conversationClosed: "Closed",
    assistantResumed: "Assistant resumed for future customer messages.",
    merchantHandoffStarted: "Assistant paused. You are now in control.",
    assistantActive: "Assistant active",
    customer: "Customer",
    latestMessage: "Latest message",
    conversationHistory: "Conversation history",
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
    latestAssistantRun: "Latest assistant run",
    assistantRunStarted: "running",
    assistantRunSucceeded: "answered",
    assistantRunFailed: "handed off",
    assistantRunCanceled: "stopped",
    assistantStatus: "Status",
    modelIdentifier: "Configured model identifier",
    enabledTools: "Enabled tools",
    modelPathUnavailable:
      "Set META_MODEL_API_URL, META_MODEL_NAME, and META_MODEL_API_KEY to enable the Meta Model API.",
    assistantAutomationLive:
      "Live Meta replies are enabled. Catalogue facts must come from the database search; failures remain in merchant handoff.",
    assistantAutomationPaused:
      "Meta is configured. Automation stays paused until you enable it here.",
    enableAssistant: "Enable live assistant",
    pauseAssistant: "Pause assistant",
    assistantAutomationUpdated: "Assistant setting saved.",
    assistantCatalogueToolRequired:
      "Enable the database catalogue search tool before activating replies.",
    assistantWriteToolsDisabled:
      "Disable order tools before activating replies. Order creation is out of scope.",
    inboxSourceNote:
      "Inbound messages are stored after webhook verification. When enabled, Meta replies use the saved catalogue and failures return the conversation to merchant handoff.",
    conversationNotFound:
      "That conversation could not be found in this demo workspace.",
    invalidConversationAction:
      "This conversation action is invalid. Refresh and try again.",
    demoReadiness: "Demo readiness",
    customerOptedOut: "Customer opted out",
    assistantUnavailable: "Assistant not connected",
    manualReply: "Write a WhatsApp reply",
    sending: "Sending…",
    sendReply: "Send reply",
    replySent: "Reply sent and saved to the conversation.",
    whatsappReplyNotConfigured:
      "WhatsApp sending is not ready. Check the connected test number, Graph API version, token encryption key, and database.",
    whatsappSignupTitle: "Connect your WhatsApp Business number",
    whatsappSignupDescription:
      "Optionally use Meta’s secure Embedded Signup to create or select a business account, share its WhatsApp Business Account, and verify a phone number for this workspace.",
    whatsappSignupSharedWorkspaceNote:
      "This demo uses a shared workspace. Only connect a number you control; anyone with demo access can manage connected workspace numbers and conversations.",
    whatsappSignupPinLabel: "WhatsApp two-step verification PIN",
    whatsappSignupPinHint:
      "Enter the number’s existing six-digit Cloud API PIN, or choose one if Meta asks you to set it. This is not the SMS verification code. It is sent to Meta once and never stored by SokoPilot; keep it somewhere safe.",
    whatsappSignupButton: "Continue with Facebook",
    whatsappSignupSdkLoading: "Loading Facebook…",
    whatsappSignupLoading: "Connecting number…",
    whatsappSignupNotConfigured:
      "Optional signup is not enabled for this deployment. An administrator must configure the Meta App ID, Graph API version, and Embedded Signup configuration ID first.",
    whatsappSignupCancelled:
      "Facebook signup was cancelled. No number was connected.",
    whatsappSignupFailed:
      "The number could not be connected. Check the Meta app configuration and server logs, then try again.",
    whatsappSignupAlreadyLinked:
      "That WhatsApp account or number is already linked to a workspace.",
    whatsappSignupSuccess: "WhatsApp number connected:",
    whatsappConnectedNumbers: "Connected WhatsApp numbers",
    whatsappConnectedNumber: "Connected number",
    whatsappConnectionReconnectRequired: "Reconnect required",
    whatsappProviderFailed:
      "WhatsApp did not confirm the reply. Check provider status before trying again.",
    whatsappSentNotSaved:
      "WhatsApp accepted the reply, but it could not be saved here. Check the conversation before retrying.",
    replyRequiresHandoff:
      "Take over the conversation before sending a manual reply.",
    settingsDescription:
      "Connect your channels and choose how your assistant supports your customers.",
    shopAssistantInstructions: "Shop information for your assistant",
    shopAssistantInstructionsDescription:
      "Add details customers may ask about, such as your shop location, opening hours, delivery area, or return policy. The assistant will use these as shop context alongside its built-in safety and catalogue rules.",
    shopAssistantInstructionsLabel: "Shop details and guidance",
    shopAssistantInstructionsPlaceholder:
      "Our shop is located in Westlands, Nairobi. We are open Monday to Saturday, 9am–6pm. We deliver within Nairobi and Kiambu…",
    shopAssistantInstructionsHint:
      "Up to 2,000 characters. Keep information accurate and avoid adding passwords, payment credentials, or other secrets.",
    saveShopInstructions: "Save shop information",
    invalidShopAssistantInstructions:
      "Shop information must be 2,000 characters or fewer.",
    testAssistant: "Test your assistant",
    testAssistantDescription:
      "Try a sample customer message against the shop information currently in the form and the current catalogue. This preview uses the configured model without activating automation, sending WhatsApp messages, or saving a conversation.",
    testAssistantMessageLabel: "Sample customer message",
    testAssistantMessagePlaceholder:
      "Hi, where is your shop located? Do you deliver to Kiambu?",
    runAssistantTest: "Generate test reply",
    testingAssistant: "Testing…",
    assistantTestReply: "Assistant preview",
    assistantTestHandoff: "Would hand off to the merchant",
    assistantTestHandoffOnly:
      "The assistant requested a merchant handoff and would not send an automatic reply.",
    invalidAssistantTestMessage:
      "Enter a customer message between 2 and 1,000 characters.",
    assistantTestCatalogueUnavailable:
      "The catalogue lookup is unavailable. Check the database and catalogue search configuration.",
    assistantTestFailed:
      "The assistant preview could not complete. Check the model configuration and try again.",
    assistantTestErrorTitle: "The test could not finish",
    assistantTestOutputLimit:
      "The model used its reply limit before finishing. Try a shorter customer message or a simpler question. If this keeps happening, ask the demo administrator to increase the model output limit.",
    assistantTestModelUnavailable:
      "The model service timed out or is temporarily unavailable. Wait a moment and try again. If it continues, ask the demo administrator to check provider status and the server logs.",
    assistantTestCredentialsRejected:
      "The model provider rejected its credentials or model setting. Ask the demo administrator to verify META_MODEL_API_KEY and META_MODEL_NAME.",
    assistantTestRateLimited:
      "The model provider is limiting requests or has reached its usage quota. Wait and try again; if it continues, ask the demo administrator to check the provider quota.",
    assistantTestInvalidModelResponse:
      "The model provider returned a response this app could not use. Retry once. If it keeps happening, ask the demo administrator to verify that the selected model supports chat completions and tool calls.",
    assistantTestToolIssue:
      "The model could not complete a catalogue or handoff step. Try a simpler customer question. If it continues, ask the demo administrator to check the assistant tool configuration and server logs.",
    assistantTestUnexpected:
      "The preview stopped unexpectedly. Try again. If it happens again, ask the demo administrator to check the server logs for this time.",
    privacyDescription:
      "Your customers' conversations should be handled with care. SokoPilot is designed to use conversation and catalogue data only to support the merchant's customer service.",
    recoveryDescription:
      "Ask the demo team for the shared access code. This temporary code is not an individual user account.",
    securityNote:
      "This shared access code is for the private demo only—not a production sign-in.",
    demoWorkspace: "Demo workspace",
    navWorkspace: "WORKSPACE",
    navManage: "MANAGE",
    workspaceName: "Demo workspace",
    workspaceType: "Fashion & beauty",
    statusNotConnected: "Private demo",
    workspacePreview: "Preview workspace",
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
      "Add accurate prices, variants, and stock so your team can answer with confidence.",
    quickActionAssistant: "Review assistant readiness",
    quickActionAssistantBody:
      "Automation is disabled until the Meta request path and safety checks are complete.",
    viewCatalogue: "View catalogue",
    configureAssistant: "Configure assistant",
    connectedChannel: "CHANNEL",
    catalogueStatus: "CATALOGUE",
    noProductsYet: "Ready for your first product",
    noProductsBody:
      "Your catalogue appears here after its first product is saved. Keep prices, variants, and stock current for accurate customer replies.",
    productsEmptyLabel: "Catalogue preview",
    conversationEmptyLabel: "Your inbox",
    conversationEmptyTitle: "A quieter inbox starts here",
    conversationEmptyBody:
      "Once WhatsApp is connected, verified customer messages will appear here for your team to review and answer.",
    conversationEmptyHint: "Your inbox is currently disconnected.",
    setupTitle: "A considered setup, before the first reply.",
    setupIntro:
      "Review channel connection, assistant status, and safety boundaries before a live demo.",
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
    privacyTitle: "Built with care for customer conversations.",
    privacyPointData: "Keep business data in the merchant workspace.",
    privacyPointControl: "Keep the merchant in control of assistant actions.",
    privacyPointClear:
      "Be clear about what is configured, measured, and still a preview.",
    recoveryTitle: "Need access to the demo?",
    recoveryAction:
      "Reach out to the person who invited you and ask for the shared demo code.",
    previewStrip: "A clearer way to care for every customer",
    featureGrounded: "Product facts in one catalogue",
    featureControl: "Your team stays in control",
    featureBilingual: "Made for English and Swahili",
    featureLabel: "A better kind of busy",
    featureTitle: "A reliable source for every product conversation.",
    featureBody:
      "Keep product, variant, price, and stock details together, then bring every customer conversation to a person who can help.",
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
    tagline: "Taarifa za bidhaa. Mazungumzo ya wateja. Sehemu moja.",
    intro:
      "Muhtasari wa bidhaa na mazungumzo ya WhatsApp kwa wafanyabiashara wa mitindo na urembo. Sasisha bei na stoku, leta maswali kwenye kikasha kimoja, na uache timu yako iwe na udhibiti.",
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
      "Kikasha kimoja cha maswali ya wateja, majibu ya timu, na mazungumzo yanayohitaji uangalizi.",
    productsDescription:
      "Sasisha bei, matoleo na stoku ili kila jibu lianze na taarifa sahihi za bidhaa.",
    addProduct: "Ongeza bidhaa",
    addProductDescription:
      "Hifadhi taarifa za bidhaa kwenye hifadhidata ili timu ijibu kwa kutumia rekodi za sasa.",
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
    productNotFound:
      "Toleo hilo la bidhaa halijapatikana katika eneo hili la kazi.",
    databaseNotConfigured:
      "Hifadhidata ya onyesho haijawekwa. Weka DATABASE_URL ya hifadhidata ya onyesho iliyosanidiwa.",
    demoDataNotSeeded:
      "Eneo la mfano halijaandaliwa. Fuata mwongozo wa usanidi wa hifadhidata maalum ya onyesho.",
    databaseWritesNotApproved:
      "Uandishi kwenye hifadhidata umezimwa hadi uidhinishe wazi hifadhidata maalum ya onyesho.",
    demoAccessExpired:
      "Muda wa ufikiaji wa onyesho umeisha. Fungua onyesho tena.",
    storageUnavailable:
      "Katalogi ya onyesho haikuweza kusomwa au kuhifadhiwa. Kagua usanidi wa hifadhidata na kumbukumbu za seva.",
    catalogueProducts: "Bidhaa za katalogi",
    catalogueUnavailable:
      "Onyesho la katalogi halipatikani hadi hifadhidata isanidiwe.",
    productActive: "Inatumika",
    productDraft: "Rasimu",
    productArchived: "Imehifadhiwa",
    catalogueSourceNote:
      "Taarifa hapa zinasomwa kutoka hifadhidata ya onyesho iliyosanidiwa.",
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
    handoffSince: "Makabidhiano tangu",
    conversationOpen: "Wazi",
    conversationHandoff: "Makabidhiano",
    conversationClosed: "Yamefungwa",
    assistantResumed: "Msaidizi ameanzishwa tena kwa ujumbe ujao wa wateja.",
    merchantHandoffStarted: "Msaidizi amesimamishwa. Sasa una udhibiti.",
    assistantActive: "Msaidizi anafanya kazi",
    customer: "Mteja",
    latestMessage: "Ujumbe wa karibuni",
    conversationHistory: "Historia ya mazungumzo",
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
    latestAssistantRun: "Jaribio la mwisho la msaidizi",
    assistantRunStarted: "linaendelea",
    assistantRunSucceeded: "limejibu",
    assistantRunFailed: "limekabidhiwa kwa mfanyabiashara",
    assistantRunCanceled: "limesimamishwa",
    assistantStatus: "Hali",
    modelIdentifier: "Kitambulisho cha modeli kilichosanidiwa",
    enabledTools: "Zana zilizowashwa",
    modelPathUnavailable:
      "Weka META_MODEL_API_URL, META_MODEL_NAME na META_MODEL_API_KEY ili kutumia Meta Model API.",
    assistantAutomationLive:
      "Majibu ya Meta yamewashwa. Taarifa za bidhaa lazima zitoke kwenye utafutaji wa hifadhidata; hitilafu hurudisha mazungumzo kwa mfanyabiashara.",
    assistantAutomationPaused:
      "Meta imesanidiwa. Uendeshaji wa kiotomatiki umesimamishwa hadi uuwashe hapa.",
    enableAssistant: "Washa msaidizi wa moja kwa moja",
    pauseAssistant: "Simamisha msaidizi",
    assistantAutomationUpdated: "Mipangilio ya msaidizi imehifadhiwa.",
    assistantCatalogueToolRequired:
      "Washa utafutaji wa katalogi kwenye hifadhidata kabla ya kuwasha majibu.",
    assistantWriteToolsDisabled:
      "Zima zana za maagizo kabla ya kuwasha majibu. Kuunda maagizo hakujajumuishwa.",
    inboxSourceNote:
      "Ujumbe unaoingia huhifadhiwa baada ya uthibitishaji wa webhook. Ukiwashwa, Meta hutumia katalogi iliyohifadhiwa; hitilafu hurudisha mazungumzo kwa mfanyabiashara.",
    conversationNotFound:
      "Mazungumzo hayo hayakupatikana katika eneo hili la onyesho.",
    invalidConversationAction:
      "Kitendo hiki cha mazungumzo si sahihi. Onyesha upya kisha ujaribu tena.",
    demoReadiness: "Utayari wa onyesho",
    customerOptedOut: "Mteja amejiondoa",
    assistantUnavailable: "Msaidizi hajaunganishwa",
    manualReply: "Andika jibu la WhatsApp",
    sending: "Inatuma…",
    sendReply: "Tuma jibu",
    replySent: "Jibu limetumwa na kuhifadhiwa kwenye mazungumzo.",
    whatsappReplyNotConfigured:
      "Utumaji wa WhatsApp hauko tayari. Kagua nambari ya majaribio, toleo la Graph API, ufunguo wa usimbaji wa tokeni na hifadhidata.",
    whatsappSignupTitle: "Unganisha nambari yako ya WhatsApp Business",
    whatsappSignupDescription:
      "Kwa hiari, tumia Embedded Signup salama ya Meta kuunda au kuchagua akaunti ya biashara, kushiriki akaunti ya WhatsApp Business, na kuthibitisha nambari ya simu kwa eneo hili la kazi.",
    whatsappSignupSharedWorkspaceNote:
      "Onyesho hili linatumia eneo la kazi la pamoja. Unganisha nambari unayomiliki pekee; kila mtu mwenye ufikiaji wa onyesho anaweza kusimamia nambari na mazungumzo yaliyounganishwa.",
    whatsappSignupPinLabel: "PIN ya uthibitishaji wa hatua mbili ya WhatsApp",
    whatsappSignupPinHint:
      "Weka PIN ya tarakimu sita ya Cloud API iliyopo, au chagua moja Meta ikikuomba. Hii si nambari ya SMS. Itatumwa kwa Meta mara moja na SokoPilot haitaihifadhi; ihifadhi mahali salama.",
    whatsappSignupButton: "Endelea na Facebook",
    whatsappSignupSdkLoading: "Inapakia Facebook…",
    whatsappSignupLoading: "Inaunganisha nambari…",
    whatsappSignupNotConfigured:
      "Usajili huu wa hiari haujawashwa kwa uwekaji huu. Msimamizi lazima aweke Meta App ID, toleo la Graph API na Embedded Signup configuration ID.",
    whatsappSignupCancelled:
      "Usajili wa Facebook umeghairiwa. Hakuna nambari iliyounganishwa.",
    whatsappSignupFailed:
      "Nambari haikuweza kuunganishwa. Kagua mipangilio ya Meta app na kumbukumbu za seva kisha ujaribu tena.",
    whatsappSignupAlreadyLinked:
      "Akaunti au nambari hiyo ya WhatsApp tayari imeunganishwa na eneo la kazi.",
    whatsappSignupSuccess: "Nambari ya WhatsApp imeunganishwa:",
    whatsappConnectedNumbers: "Nambari za WhatsApp zilizounganishwa",
    whatsappConnectedNumber: "Nambari iliyounganishwa",
    whatsappConnectionReconnectRequired: "Unganisha tena",
    whatsappProviderFailed:
      "WhatsApp haijathibitisha jibu. Kagua hali ya mtoa huduma kabla ya kujaribu tena.",
    whatsappSentNotSaved:
      "WhatsApp imekubali jibu lakini halikuweza kuhifadhiwa hapa. Kagua mazungumzo kabla ya kutuma tena.",
    replyRequiresHandoff: "Chukua udhibiti wa mazungumzo kabla ya kutuma jibu.",
    settingsDescription:
      "Unganisha njia zako za mawasiliano na uchague jinsi msaidizi atakavyowahudumia wateja.",
    shopAssistantInstructions: "Taarifa za duka kwa msaidizi",
    shopAssistantInstructionsDescription:
      "Ongeza maelezo ambayo wateja wanaweza kuuliza, kama vile eneo la duka, saa za kazi, maeneo ya usafirishaji au sera ya kurejesha bidhaa. Msaidizi atatumia maelezo haya pamoja na kanuni zake za usalama na katalogi.",
    shopAssistantInstructionsLabel: "Maelezo na mwongozo wa duka",
    shopAssistantInstructionsPlaceholder:
      "Duka letu liko Westlands, Nairobi. Tuko wazi Jumatatu hadi Jumamosi, saa 3 asubuhi hadi saa 12 jioni. Tunapeleka bidhaa Nairobi na Kiambu…",
    shopAssistantInstructionsHint:
      "Hadi herufi 2,000. Hakikisha maelezo ni sahihi na usiweke nywila, taarifa za malipo au siri nyingine.",
    saveShopInstructions: "Hifadhi maelezo ya duka",
    invalidShopAssistantInstructions: "Maelezo ya duka yasizidi herufi 2,000.",
    testAssistant: "Jaribu msaidizi wako",
    testAssistantDescription:
      "Jaribu ujumbe wa mfano wa mteja ukitumia taarifa za duka zilizo kwenye fomu na katalogi ya sasa. Jaribio hili hutumia modeli iliyosanidiwa bila kuwasha uendeshaji wa kiotomatiki, kutuma ujumbe wa WhatsApp au kuhifadhi mazungumzo.",
    testAssistantMessageLabel: "Ujumbe wa mfano wa mteja",
    testAssistantMessagePlaceholder:
      "Habari, duka lenu liko wapi? Mnasafirisha bidhaa Kiambu?",
    runAssistantTest: "Tengeneza jibu la jaribio",
    testingAssistant: "Inajaribu…",
    assistantTestReply: "Jibu la majaribio la msaidizi",
    assistantTestHandoff: "Atakabidhi kwa mfanyabiashara",
    assistantTestHandoffOnly:
      "Msaidizi ameomba kumkabidhi mfanyabiashara na hatatuma jibu la kiotomatiki.",
    invalidAssistantTestMessage:
      "Weka ujumbe wa mteja wenye herufi 2 hadi 1,000.",
    assistantTestCatalogueUnavailable:
      "Utafutaji wa katalogi haupatikani. Kagua hifadhidata na usanidi wa utafutaji wa katalogi.",
    assistantTestFailed:
      "Jaribio la msaidizi halikukamilika. Kagua usanidi wa modeli kisha ujaribu tena.",
    assistantTestErrorTitle: "Jaribio halikukamilika",
    assistantTestOutputLimit:
      "Modeli ilifikia kikomo cha jibu kabla ya kumaliza. Jaribu ujumbe mfupi au swali rahisi zaidi. Ikiendelea, mwombe msimamizi wa onyesho aongeze kikomo cha matokeo ya modeli.",
    assistantTestModelUnavailable:
      "Huduma ya modeli imechelewa au haipatikani kwa sasa. Subiri kidogo kisha ujaribu tena. Ikiendelea, mwombe msimamizi wa onyesho akague hali ya huduma na kumbukumbu za seva.",
    assistantTestCredentialsRejected:
      "Mtoa huduma wa modeli amekataa taarifa za kuingia au usanidi wa modeli. Mwombe msimamizi wa onyesho athibitishe META_MODEL_API_KEY na META_MODEL_NAME.",
    assistantTestRateLimited:
      "Mtoa huduma wa modeli anapunguza maombi au kikomo cha matumizi kimefikiwa. Subiri kisha ujaribu tena; ikiendelea, mwombe msimamizi akague kikomo cha matumizi.",
    assistantTestInvalidModelResponse:
      "Mtoa huduma wa modeli ametoa jibu ambalo programu haiwezi kutumia. Jaribu tena. Ikiendelea, mwombe msimamizi athibitishe kuwa modeli iliyochaguliwa inasaidia chat completions na tool calls.",
    assistantTestToolIssue:
      "Modeli haikuweza kukamilisha hatua ya kutafuta katalogi au kukabidhi mazungumzo. Jaribu swali rahisi zaidi. Ikiendelea, mwombe msimamizi akague zana za msaidizi na kumbukumbu za seva.",
    assistantTestUnexpected:
      "Jaribio limesimama bila kutarajiwa. Jaribu tena. Likitokea tena, mwombe msimamizi akague kumbukumbu za seva za wakati huu.",
    privacyDescription:
      "Mazungumzo ya wateja wako yanapaswa kushughulikiwa kwa uangalifu. SokoPilot imeundwa kutumia data ya mazungumzo na katalogi kusaidia huduma kwa wateja pekee.",
    recoveryDescription:
      "Omba msimbo wa pamoja kutoka kwa timu ya onyesho. Msimbo huu wa muda si akaunti binafsi ya mtumiaji.",
    securityNote:
      "Msimbo huu wa pamoja ni wa onyesho la faragha tu—si njia ya kuingia kwa uzalishaji.",
    demoWorkspace: "Eneo la onyesho",
    navWorkspace: "ENEO LA KAZI",
    navManage: "USIMAMIZI",
    workspaceName: "Eneo la onyesho",
    workspaceType: "Mitindo na urembo",
    statusNotConnected: "Onyesho la faragha",
    workspacePreview: "Eneo la onyesho",
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
      "Ongeza bei, matoleo na stoku sahihi ili timu ijibu kwa uhakika.",
    quickActionAssistant: "Kagua utayari wa msaidizi",
    quickActionAssistantBody:
      "Uendeshaji wa kiotomatiki umezimwa hadi njia ya Meta na ukaguzi wa usalama vikamilike.",
    viewCatalogue: "Tazama katalogi",
    configureAssistant: "Sanidi msaidizi",
    connectedChannel: "NJIA YA MAWASILIANO",
    catalogueStatus: "KATALOGI",
    noProductsYet: "Tayari kwa bidhaa yako ya kwanza",
    noProductsBody:
      "Katalogi itaonekana baada ya bidhaa ya kwanza kuhifadhiwa. Sasisha bei, matoleo na stoku kwa majibu sahihi.",
    productsEmptyLabel: "Onyesho la katalogi",
    conversationEmptyLabel: "Kikasha chako",
    conversationEmptyTitle: "Kikasha tulivu kinaanzia hapa",
    conversationEmptyBody:
      "Baada ya kuunganisha WhatsApp, ujumbe wa wateja uliothibitishwa utaonekana hapa ili timu ikague na kujibu.",
    conversationEmptyHint: "Kikasha chako hakijaunganishwa kwa sasa.",
    setupTitle: "Usanidi makini kabla ya jibu la kwanza.",
    setupIntro:
      "Kagua muunganisho wa njia, hali ya msaidizi na mipaka ya usalama kabla ya onyesho la moja kwa moja.",
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
    privacyTitle: "Imeundwa kwa uangalifu wa mazungumzo ya wateja.",
    privacyPointData: "Hifadhi data ya biashara katika eneo la mfanyabiashara.",
    privacyPointControl: "Mfanyabiashara adhibiti vitendo vya msaidizi.",
    privacyPointClear:
      "Eleza wazi kilichosanidiwa, kilichopimwa, na kilicho onyesho tu.",
    recoveryTitle: "Unahitaji kuingia kwenye onyesho?",
    recoveryAction:
      "Wasiliana na aliyekualika na uombe msimbo wa pamoja wa onyesho.",
    previewStrip: "Njia yenye umakini zaidi ya kumjali kila mteja",
    featureGrounded: "Taarifa za bidhaa kwenye katalogi moja",
    featureControl: "Timu yako inaendelea kuwa na udhibiti",
    featureBilingual: "Imeundwa kwa Kiingereza na Kiswahili",
    featureLabel: "Biashara yenye utulivu zaidi",
    featureTitle: "Chanzo cha kuaminika kwa kila mazungumzo ya bidhaa.",
    featureBody:
      "Weka bidhaa, matoleo, bei na stoku pamoja, kisha peleka kila mazungumzo kwa mtu anayeweza kusaidia.",
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
