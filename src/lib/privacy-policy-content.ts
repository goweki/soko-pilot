import type { Locale } from "@/lib/i18n";

type PrivacyPolicyContent = {
  title: string;
  introduction: string;
  updatedLabel: string;
  sections: Array<{ title: string; paragraphs: string[]; list?: string[] }>;
  draftNotice: string;
};

const policies: Record<Locale, PrivacyPolicyContent> = {
  en: {
    title: "Privacy policy",
    introduction:
      "This notice explains how SokoPilot handles information in its current private-demo version. SokoPilot is a merchant-facing tool for managing a product catalogue and WhatsApp customer conversations. The notice describes the software as currently built; the organization operating a deployment is responsible for its configuration and for any additional notices required by law.",
    updatedLabel: "Last updated",
    sections: [
      {
        title: "Information this demo handles",
        paragraphs: [
          "The demo uses a shared access passcode, not individual user accounts. The passcode is checked by the server and is not stored as a user profile. After access is granted, a signed, HTTP-only cookie remembers that access for a limited time.",
          "Depending on which features and integrations the operator configures, SokoPilot may process:",
        ],
        list: [
          "Merchant workspace information, including business details, product names, descriptions, variants, prices, and stock.",
          "WhatsApp customer details such as phone number or WhatsApp ID and, when provided by WhatsApp, display name.",
          "Conversation data such as message text, message type, provider message IDs, media IDs, timestamps, and delivery or handoff status. The current app records media identifiers but does not download or interpret the media itself.",
          "Integration configuration and encrypted WhatsApp access tokens.",
          "Technical request and diagnostic information handled by the hosting, database, or messaging providers used by the deployment.",
        ],
      },
      {
        title: "How information is used",
        paragraphs: [
          "Information is used to provide the merchant dashboard, display catalogue and conversation records, verify and deduplicate inbound WhatsApp webhooks, support merchant handoff, and send a manual reply when that feature has been configured and authorized. It may also be used to protect, maintain, and troubleshoot the service.",
          "Automated AI-model inference and assistant-generated replies are not implemented in the current version. If those capabilities are added, this notice should be updated before they are enabled.",
        ],
      },
      {
        title: "WhatsApp and other service providers",
        paragraphs: [
          "If a deployment connects a WhatsApp Business number, messages travel through Meta/WhatsApp services. The merchant and Meta/WhatsApp may process information under their own privacy terms. The deployment also relies on the hosting and database providers selected by its operator; those providers may process information to run the service.",
          "The exact providers, locations, and settings depend on the deployment. The SokoPilot demo is not currently configured with a live model provider.",
        ],
      },
      {
        title: "Sharing and advertising",
        paragraphs: [
          "SokoPilot is not designed to sell personal information or use customer conversation data for advertising. Information is available to the merchant workspace and to service providers needed to operate the configured deployment. Anyone given the shared demo passcode may be able to access the same demo workspace; the passcode does not identify individual users.",
        ],
      },
      {
        title: "Retention and deletion",
        paragraphs: [
          "The current app does not have an automatic data-retention or deletion schedule. Records remain in the configured database until the deployment operator deletes them or removes the database. Hosting, database, and backup providers may retain technical records according to the operator's settings and their own policies.",
          "For a copy, correction, or deletion of a WhatsApp conversation, contact the merchant you messaged. For information stored in a SokoPilot deployment, contact the organization operating that deployment.",
        ],
      },
      {
        title: "Your choices",
        paragraphs: [
          "The current app recognizes WhatsApp messages containing STOP, STOP ALL, or UNSUBSCRIBE, records the opt-out, and blocks manual replies to that customer from the app. You may also contact the merchant directly about your communication preferences.",
          "The shared demo passcode is an access control for a private preview, not an individual account or a production-grade identity system. Do not send sensitive information through a demo unless its operator has confirmed that the environment is appropriate.",
        ],
      },
      {
        title: "Security",
        paragraphs: [
          "The app verifies WhatsApp webhook signatures, limits duplicate message processing, and encrypts stored WhatsApp access tokens using AES-256-GCM. The demo gate uses a signed, HTTP-only cookie. These measures reduce risk but cannot guarantee that information is always secure; operators should restrict access, protect credentials, and use a dedicated database.",
        ],
      },
      {
        title: "Changes and contact",
        paragraphs: [
          "This notice may change as SokoPilot develops. The organization operating your SokoPilot deployment is responsible for publishing the applicable version and providing a privacy contact. This project does not currently publish a separate privacy-contact email address.",
          "For questions about a conversation, contact the merchant you messaged. For questions about the SokoPilot deployment or its stored data, contact the organization that provided you access.",
        ],
      },
    ],
    draftNotice:
      "This notice describes the current product implementation and is not legal advice. The deployment operator should review and adapt it for the applicable jurisdictions, providers, and actual data practices before public launch.",
  },
  sw: {
    title: "Sera ya faragha",
    introduction:
      "Notisi hii inaeleza jinsi SokoPilot inavyoshughulikia taarifa katika toleo lake la sasa la onyesho la faragha. SokoPilot ni zana ya wafanyabiashara ya kusimamia katalogi ya bidhaa na mazungumzo ya wateja kupitia WhatsApp. Notisi inaeleza programu ilivyojengwa kwa sasa; shirika linaloendesha huduma linawajibika kwa usanidi wake na notisi nyingine zinazohitajika kisheria.",
    updatedLabel: "Ilisasishwa mwisho",
    sections: [
      {
        title: "Taarifa zinazoshughulikiwa na onyesho hili",
        paragraphs: [
          "Onyesho hutumia msimbo mmoja wa pamoja wa kuingia, si akaunti binafsi za watumiaji. Seva hukagua msimbo huo na hauhifadhiwi kama wasifu wa mtumiaji. Baada ya ruhusa kutolewa, kidakuzi kilichotiwa saini na kisichoweza kusomwa na JavaScript hukumbuka ruhusa hiyo kwa muda maalum.",
          "Kulingana na vipengele na miunganisho iliyosanidiwa na mwendeshaji, SokoPilot inaweza kushughulikia:",
        ],
        list: [
          "Taarifa za eneo la mfanyabiashara, ikiwemo maelezo ya biashara, majina na maelezo ya bidhaa, aina zake, bei na idadi ya bidhaa zilizopo.",
          "Maelezo ya wateja wa WhatsApp kama nambari ya simu au kitambulisho cha WhatsApp na, WhatsApp ikitoa, jina la kuonekana.",
          "Taarifa za mazungumzo kama maandishi ya ujumbe, aina ya ujumbe, vitambulisho vya ujumbe vya mtoa huduma, vitambulisho vya faili, nyakati na hali ya ujumbe au kukabidhi mazungumzo kwa mfanyabiashara. Programu ya sasa huhifadhi vitambulisho vya faili lakini haipakui wala kuchambua faili hizo.",
          "Mipangilio ya miunganisho na tokeni za WhatsApp zilizohifadhiwa kwa usimbaji fiche.",
          "Taarifa za kiufundi za maombi na uchunguzi zinazoshughulikiwa na watoa huduma wa seva, hifadhidata au ujumbe waliotumiwa na mfumo.",
        ],
      },
      {
        title: "Jinsi taarifa zinavyotumika",
        paragraphs: [
          "Taarifa hutumika kutoa dashibodi ya mfanyabiashara, kuonyesha katalogi na rekodi za mazungumzo, kuthibitisha na kuondoa nakala za webhook zinazoingia za WhatsApp, kusaidia kukabidhi mazungumzo kwa mfanyabiashara, na kutuma jibu la mkono ikiwa kipengele hicho kimesanidiwa na kuidhinishwa. Zinaweza pia kutumika kulinda, kudumisha na kutatua matatizo ya huduma.",
          "Uendeshaji wa modeli ya AI kiotomatiki na majibu yanayotengenezwa na msaidizi hayajatekelezwa katika toleo la sasa. Vipengele hivyo vikiongezwa, notisi hii inapaswa kusasishwa kabla ya kuwashwa.",
        ],
      },
      {
        title: "WhatsApp na watoa huduma wengine",
        paragraphs: [
          "Mfumo ukiunganisha nambari ya WhatsApp Business, ujumbe hupitia huduma za Meta/WhatsApp. Mfanyabiashara na Meta/WhatsApp wanaweza kushughulikia taarifa kulingana na masharti yao ya faragha. Mfumo pia hutegemea watoa huduma wa seva na hifadhidata waliochaguliwa na mwendeshaji; watoa huduma hao wanaweza kushughulikia taarifa ili kuendesha huduma.",
          "Watoa huduma, maeneo na mipangilio hutegemea mfumo husika. Onyesho la SokoPilot kwa sasa halijaunganishwa na mtoa huduma wa modeli ya AI.",
        ],
      },
      {
        title: "Kushiriki taarifa na matangazo",
        paragraphs: [
          "SokoPilot haijaundwa kuuza taarifa binafsi au kutumia mazungumzo ya wateja kwa matangazo. Taarifa hupatikana kwa eneo la mfanyabiashara na kwa watoa huduma wanaohitajika kuendesha mfumo uliosanidiwa. Mtu yeyote aliyepewa msimbo wa pamoja wa onyesho anaweza kufikia eneo hilo hilo; msimbo huo hautambui watumiaji binafsi.",
        ],
      },
      {
        title: "Uhifadhi na ufutaji",
        paragraphs: [
          "Programu ya sasa haina ratiba ya kiotomatiki ya kuhifadhi au kufuta taarifa. Rekodi hubaki kwenye hifadhidata iliyosanidiwa hadi mwendeshaji wa mfumo azifute au aondoe hifadhidata. Watoa huduma wa seva, hifadhidata na nakala rudufu wanaweza kuhifadhi rekodi za kiufundi kulingana na mipangilio ya mwendeshaji na sera zao.",
          "Kwa nakala, marekebisho au ufutaji wa mazungumzo ya WhatsApp, wasiliana na mfanyabiashara uliyemtumia ujumbe. Kwa taarifa zilizohifadhiwa kwenye mfumo wa SokoPilot, wasiliana na shirika linaloendesha mfumo huo.",
        ],
      },
      {
        title: "Chaguo zako",
        paragraphs: [
          "Programu ya sasa hutambua ujumbe wa WhatsApp wenye STOP, STOP ALL au UNSUBSCRIBE, huhifadhi ombi la kujiondoa, na huzuia programu kutuma majibu ya mkono kwa mteja huyo. Unaweza pia kuwasiliana moja kwa moja na mfanyabiashara kuhusu mapendeleo yako ya mawasiliano.",
          "Msimbo wa pamoja wa onyesho ni udhibiti wa ufikiaji wa toleo la majaribio la faragha, si akaunti binafsi au mfumo kamili wa utambulisho wa uzalishaji. Usitume taarifa nyeti kupitia onyesho isipokuwa mwendeshaji athibitishe kuwa mazingira hayo yanafaa.",
        ],
      },
      {
        title: "Usalama",
        paragraphs: [
          "Programu huthibitisha saini za webhook za WhatsApp, hupunguza uchakataji wa ujumbe unaojirudia, na husimba tokeni za WhatsApp zilizohifadhiwa kwa AES-256-GCM. Msimbo wa onyesho hutumia kidakuzi kilichotiwa saini na kisichoweza kusomwa na JavaScript. Hatua hizi hupunguza hatari lakini haziwezi kuhakikisha usalama kamili wa taarifa; waendeshaji wanapaswa kudhibiti ufikiaji, kulinda siri na kutumia hifadhidata maalum.",
        ],
      },
      {
        title: "Mabadiliko na mawasiliano",
        paragraphs: [
          "Notisi hii inaweza kubadilika kadiri SokoPilot inavyoendelea. Shirika linaloendesha mfumo wako wa SokoPilot linawajibika kuchapisha toleo linalotumika na kutoa mawasiliano ya masuala ya faragha. Mradi huu kwa sasa haujachapisha anwani maalum ya barua pepe kwa masuala ya faragha.",
          "Kwa maswali kuhusu mazungumzo, wasiliana na mfanyabiashara uliyemtumia ujumbe. Kwa maswali kuhusu mfumo wa SokoPilot au taarifa zilizohifadhiwa humo, wasiliana na shirika lililokupa ufikiaji.",
        ],
      },
    ],
    draftNotice:
      "Notisi hii inaeleza utekelezaji wa sasa wa bidhaa na si ushauri wa kisheria. Kabla ya uzinduzi wa umma, mwendeshaji wa mfumo anapaswa kuikagua na kuibadilisha kulingana na sheria husika, watoa huduma na namna halisi taarifa zinavyoshughulikiwa.",
  },
};

export function getPrivacyPolicyContent(locale: Locale): PrivacyPolicyContent {
  return policies[locale];
}
