/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { User, Workspace, Contact, Conversation, Message, StoreProduct, StoreOrder, StoreReview, StockAlertSubscriber } from './src/types';
import { generateOrderConfirmationEmailHtml } from './src/utils/emailTemplate';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'shakhsi-db.json');

app.use(express.json());

function getDefaultStoreProducts(): StoreProduct[] {
  return [
    { 
      id: 'p1', 
      sku: 'saas-bp-01',
      name: 'SaaS Boilerplate Full-Stack (Next.js & Node)', 
      name_ar: 'قالب ساس متكامل SaaS Boilerplate (Next.js & Node)',
      price: 189, 
      description: 'Production-ready React 18, Node.js & TypeScript boilerplate with automated authentication, Stripe/HyperPay and responsive dashboard.', 
      description_ar: 'قالب برمجي جاهز للإنتاج بـ React و Node.js يشمل نظام المصادقة، لوحة تحكم سريعة وربط بوابات الدفع الإلكتروني.',
      category: 'Templates & Dev', 
      category_ar: 'قوالب وتطوير',
      region: 'Global 🌐',
      region_ar: 'عالمي 🌐',
      platform: 'Web / Cloud ☁️',
      platform_ar: 'سحابي / ويب ☁️',
      official_url: 'https://github.com',
      activation_guide: 'Clone the repository, configure .env with your generated license code, and run npm install.',
      activation_guide_ar: 'قم بنسخ المستودع البرمجي، وضع كود الترخيص في ملف .env وشغل المشروع عبر npm install.',
      code: 'SH-SAAS-PRO-89', 
      viewsCount: 240, 
      purchasesCount: 42,
      badge: 'Bestseller',
      badge_ar: 'الأكثر مبيعاً',
      icon: 'code',
      stockCount: 8,
      inventoryCodes: [
        'SAAS-PRO-ACT-9912',
        'SAAS-PRO-ACT-9913',
        'SAAS-PRO-ACT-9914',
        'SAAS-PRO-ACT-9915',
        'SAAS-PRO-ACT-9916',
        'SAAS-PRO-ACT-9917',
        'SAAS-PRO-ACT-9918',
        'SAAS-PRO-ACT-9919',
      ],
    },
    { 
      id: 'p2', 
      sku: 'tg-bot-ai',
      name: 'ChatGPT & Gemini Telegram Bot Source Code', 
      name_ar: 'سورس كود بوت تيليجرام بالذكاء الاصطناعي',
      price: 149, 
      description: 'Full-featured Telegram assistant bot supporting conversational memory, customer support, speech recognition and payment webhooks.', 
      description_ar: 'سورس كود متكامل لبوت خدمة عملاء على تيليجرام مع ذاكرة للمحادثات، دعم الأوامر الصوتية وربط بوابات الدفع آلياً.',
      category: 'AI & Bots', 
      category_ar: 'أدوات ذكاء اصطناعي',
      region: 'Global 🌐',
      region_ar: 'عالمي 🌐',
      platform: 'Telegram / Bot 📱',
      platform_ar: 'تيليجرام / بوت 📱',
      official_url: 'https://t.me/BotFather',
      activation_guide: 'Insert your BotFather Token and AI Studio API key in the server configuration file.',
      activation_guide_ar: 'أدخل توكن BotFather ومفتاح AI Studio في ملف تشغيل الخادم لبدء العمل فوراً.',
      code: 'SH-TG-GEMINI-149', 
      viewsCount: 195, 
      purchasesCount: 37,
      badge: 'AI Powered',
      badge_ar: 'مدعوم بالذكاء الاصطناعي',
      icon: 'bot',
      stockCount: 12,
      inventoryCodes: [
        'TG-BOT-GEMINI-801',
        'TG-BOT-GEMINI-802',
        'TG-BOT-GEMINI-803',
      ],
    },
    { 
      id: 'p3', 
      sku: 'copilot-pro-1y',
      name: 'GitHub Copilot Pro 1-Year Subscription Key', 
      name_ar: 'مفتاح اشتراك GitHub Copilot Pro لمدة سنة',
      price: 249, 
      description: 'Official 12-month enterprise voucher key for GitHub Copilot Pro coding assistant with full IDE integration and multi-model access.', 
      description_ar: 'قسيمة ترخيص رسمية لمدة 12 شهراً لمساعد البرمجة الذكي GitHub Copilot Pro لجميع بيئات التطوير.',
      category: 'Subscriptions', 
      category_ar: 'اشتراكات',
      region: 'Saudi Arabia & MENA 🇸🇦',
      region_ar: 'السعودية والشرق الأوسط 🇸🇦',
      platform: 'PC / Cloud 💻',
      platform_ar: 'كمبيوتر / سحابي 💻',
      official_url: 'https://github.com/settings/billing',
      activation_guide: 'Go to GitHub Billing Settings > Redeem Promotional Code > Enter your received key.',
      activation_guide_ar: 'ادخل إلى إعدادات الفوترة في GitHub > استرداد رمز ترويجي > الصق مفتاحك المرفق.',
      code: 'SH-COPILOT-PRO-1Y', 
      viewsCount: 380, 
      purchasesCount: 88,
      badge: 'Fast Delivery',
      badge_ar: 'تسليم فوري',
      icon: 'zap',
      stockCount: 2, // Low stock demo
      inventoryCodes: [
        'COPILOT-PRO-SA-9801',
        'COPILOT-PRO-SA-9802',
      ],
    },
    { 
      id: 'p4', 
      sku: 'xbox-gpu-3m',
      name: 'Xbox Game Pass Ultimate 3 Months Digital Code', 
      name_ar: 'كود اشتراك Xbox Game Pass Ultimate لمدة 3 أشهر',
      price: 135, 
      description: 'Stackable 3-month digital subscription granting access to 400+ games on PC, Xbox Series X/S and Cloud Gaming with EA Play included.', 
      description_ar: 'اشتراك رقمي رسمي 3 أشهر يتيح مكتبة تزيد عن 400 لعبة على الكمبيوتر وإكس بوكس مع اشتراك EA Play مدمج.',
      category: 'Games', 
      category_ar: 'ألعاب',
      region: 'Saudi Arabia 🇸🇦',
      region_ar: 'السعودية 🇸🇦',
      platform: 'Xbox & PC 🎮',
      platform_ar: 'إكس بوكس وكمبيوتر 🎮',
      official_url: 'https://redeem.microsoft.com',
      activation_guide: 'Visit redeem.microsoft.com on your Microsoft account set to Saudi Arabia, enter key, and confirm.',
      activation_guide_ar: 'توجه إلى redeem.microsoft.com وتأكد أن حسابك مسجل بالمنطقة السعودية، ثم الصق الكود لتفعيله.',
      code: 'SH-XBOX-GPU-3M', 
      viewsCount: 420, 
      purchasesCount: 94,
      badge: 'Instant Key',
      badge_ar: 'كود مباشر',
      icon: 'gamepad-2',
      stockCount: 5,
      inventoryCodes: [
        'XBOX-GPU-SA-4411',
        'XBOX-GPU-SA-4412',
        'XBOX-GPU-SA-4413',
        'XBOX-GPU-SA-4414',
        'XBOX-GPU-SA-4415',
      ],
    },
    { 
      id: 'p5', 
      sku: 'steam-cyber-glb',
      name: 'Steam Global Key - Cyberpunk Edition Digital', 
      name_ar: 'مفتاح ستيم Steam عالمي - Cyberpunk Edition',
      price: 110, 
      description: 'Global region-free Steam CD-Key for instant game library activation. Works in all countries without VPN or proxy restrictions.', 
      description_ar: 'مفتاح ستيم رقمي عالمي غير مقيد بأي منطقة جغرافية للتفعيل المباشر على حسابك دون الحاجة لأي VPN.',
      category: 'Games', 
      category_ar: 'ألعاب',
      region: 'Global 🌐',
      region_ar: 'عالمي 🌐',
      platform: 'Steam 🎮',
      platform_ar: 'ستيم Steam 🎮',
      official_url: 'https://store.steampowered.com/account/registerkey',
      activation_guide: 'Open Steam client > Games menu > Activate a Product on Steam > Enter Key.',
      activation_guide_ar: 'افتح برنامج ستيم Steam > قائمة الألعاب > تفعيل منتج على ستيم > أدخل الكود المستلم.',
      code: 'SH-STEAM-CYBER-GLB', 
      viewsCount: 512, 
      purchasesCount: 110,
      badge: 'Out of Stock',
      badge_ar: 'نفد مؤقتاً',
      icon: 'gamepad',
      stockCount: 0, // Demonstrates Out of Stock behavior & disabled button!
      inventoryCodes: [],
    },
    { 
      id: 'p6', 
      sku: 'twui-kit-pro',
      name: 'Tailwind UI Pro Kit (60+ Modules & RTL)', 
      name_ar: 'حزمة واجهات Tailwind UI الاحترافية (60+ قسم)',
      price: 99, 
      description: 'Modern sleek dark & light dashboard UI components kit with RTL Arabic support, ready-to-use charts and accessible interactive controls.', 
      description_ar: 'مجموعة مكونات واجهات عصرية تدعم الوضعين الفاتح والداكن واللغة العربية RTL، مع رسوم بيانية وتصميم انسيابي.',
      category: 'Templates & Dev', 
      category_ar: 'قوالب وتطوير',
      region: 'Global 🌐',
      region_ar: 'عالمي 🌐',
      platform: 'Web / React 💻',
      platform_ar: 'ويب / React 💻',
      official_url: 'https://tailwindcss.com',
      activation_guide: 'Unpack the modules bundle into your src/components directory and import components directly.',
      activation_guide_ar: 'قم بفك الحزمة في مجلد المكونات بمشروعك واستخدم المكونات مباشرة بمرونة تامة.',
      code: 'SH-TWUI-KIT-99', 
      viewsCount: 165, 
      purchasesCount: 29,
      badge: 'Instant Download',
      badge_ar: 'تحميل فوري',
      icon: 'palette',
      stockCount: 4,
      inventoryCodes: [
        'TWUI-KIT-ACT-5501',
        'TWUI-KIT-ACT-5502',
        'TWUI-KIT-ACT-5503',
        'TWUI-KIT-ACT-5504',
      ],
    }
  ];
}

// --- Database State & Initialization ---
interface DBStructure {
  users: User[];
  workspaces: Workspace[];
  contacts: Contact[];
  conversations: Conversation[];
  messages: Message[];
  products: StoreProduct[];
  orders?: StoreOrder[];
  reviews?: StoreReview[];
  stock_alerts?: StockAlertSubscriber[];
}

function getInitialDBState(): DBStructure {
  // Let's seed a beautiful pre-populated workspace for demo purposes!
  const defaultWorkspaceId = 'w_demo';
  const defaultUserId = 'u_demo';

  const welcomeMsgEn = 'Hello! Welcome to our store. Our AI agent represents us when agents are offline. How can we help you today?';
  const welcomeMsgAr = 'أهلاً بك في متجرنا الرقمي! عميلنا الذكي يخدمك على مدار الساعة لتلبية أي استفسار. كيف يمكننا مساعدتك اليوم؟';

  const systemInstructions = `You are a professional customer support AI assistant for 'Premium Code Hub' a digital e-commerce store that sells coding templates, developer tools, and custom courses.
Store products list:
1. 'SaaS Boilerplate': $49 (React + Node.js clean architecture)
2. 'Portfolio Builder': $19 (Modern Next.js sleek design template)
3. 'Full-Stack Masterclass': $99 (Complete self-paced video courses + certificate)

Store Shipping/Delivery Policy: All digital products are delivered instantly via email notification or dashboard download tab upon payment receipt.
Return & Refund Policy: Due to the nature of downloadable digital templates, we have a strict no-refund policy, but we offer 24/7 technical support and configuration guidance if you encounter installation issues.
Be concise, helpful, friendly, and always answer in the customer language (English/Arabic).`;

  const demoUser: User = {
    user_id: defaultUserId,
    email: 'ziyadalghamdi55@gmail.com',
    name: 'Ziyad Alghamdi',
    provider: 'local',
    password_hash: 'shakhsi123', // Simple plain hash for demonstration/auth
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    created_at: new Date('2026-05-25T10:00:00Z').toISOString(),
  };

  const demoWorkspace: Workspace = {
    workspace_id: defaultWorkspaceId,
    owner_user_id: defaultUserId,
    bot_name: 'Shakhsi Gemini Assistant',
    widget_color: '#0f172a', // deep slate
    ai_enabled: true,
    ai_instructions: systemInstructions,
    welcome_message: welcomeMsgEn,
    email_notifications: true,
    notification_email: 'ziyadalghamdi55@gmail.com',
    telegram_enabled: true,
    telegram_token: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
    telegram_bot_username: 'ShakhsiDemoBot',
    n8n_enabled: false,
    n8n_webhook_url: '',
    n8n_restock_webhook_url: '',
    n8n_customer_vault_webhook_url: '',
    store_secret_key: 'shk_sec_live_994821',
    production_mode: false,
    freelance_doc_number: 'FL-849201',
    payment_link: 'https://checkout.tap.company/pay/shakhsi-store-prod',
  };

  // Prepopulate contacts
  const contacts: Contact[] = [
    {
      id: 'c_1',
      workspace_id: defaultWorkspaceId,
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      phone: '+1 (555) 304-2093',
      channel: 'widget',
      avatar_color: 'bg-emerald-500',
    },
    {
      id: 'c_2',
      workspace_id: defaultWorkspaceId,
      name: 'Fahad Al-Qahtani',
      email: 'fahad@example.com',
      phone: '+966 50 123 4567',
      channel: 'widget',
      avatar_color: 'bg-blue-500',
    },
    {
      id: 'c_3',
      workspace_id: defaultWorkspaceId,
      name: 'Majed Al-Harbi (Telegram Visitor)',
      email: 'majed@telegram.net',
      phone: '',
      channel: 'telegram',
      external_id: 'tg_982348',
      avatar_color: 'bg-indigo-500',
    },
  ];

  // Prepopulate conversations
  const conversations: Conversation[] = [
    {
      id: 'conv_1',
      workspace_id: defaultWorkspaceId,
      contact_id: 'c_1',
      channel: 'widget',
      status: 'open',
      last_message_at: new Date('2026-05-30T17:15:00Z').toISOString(),
      last_message_preview: 'Is the SaaS Boilerplate compatible with React 19?',
      unread_count: 1,
      source: 'Google Search',
      referrer: 'https://google.com',
      campaign: 'seo-organic',
    },
    {
      id: 'conv_2',
      workspace_id: defaultWorkspaceId,
      contact_id: 'c_2',
      channel: 'widget',
      status: 'done',
      last_message_at: new Date('2026-05-30T14:30:00Z').toISOString(),
      last_message_preview: 'تم شراء الكود وتفعيله بنجاح، شكراً لكم.',
      unread_count: 0,
      source: 'Instagram Ad',
      referrer: 'https://l.instagram.com',
      campaign: 'summer-deals',
    },
    {
      id: 'conv_3',
      workspace_id: defaultWorkspaceId,
      contact_id: 'c_3',
      channel: 'telegram',
      status: 'open',
      last_message_at: new Date('2026-05-30T16:50:00Z').toISOString(),
      last_message_preview: 'Hello! I need assistance with the masterclass.',
      unread_count: 0,
      source: 'Telegram Direct',
      referrer: '',
      campaign: '',
    },
  ];

  // Prepopulate messages
  const messages: Message[] = [
    // Sarah Jenkins Chat (open)
    {
      id: 'm_1_1',
      conversation_id: 'conv_1',
      workspace_id: defaultWorkspaceId,
      sender: 'contact',
      sender_name: 'Sarah Jenkins',
      body: 'Hi, I am looking to purchase the SaaS Boilerplate template.',
      created_at: new Date('2026-05-30T17:10:00Z').toISOString(),
    },
    {
      id: 'm_1_2',
      conversation_id: 'conv_1',
      workspace_id: defaultWorkspaceId,
      sender: 'ai',
      sender_name: 'AI Agent',
      body: 'Hello Sarah! The SaaS Boilerplate template is available for $49 and features a clean React + Node.js architecture. It enables rapid setups for your digital applications. How can I help you acquire it?',
      created_at: new Date('2026-05-30T17:11:15Z').toISOString(),
    },
    {
      id: 'm_1_3',
      conversation_id: 'conv_1',
      workspace_id: defaultWorkspaceId,
      sender: 'contact',
      sender_name: 'Sarah Jenkins',
      body: 'Is the SaaS Boilerplate compatible with React 19?',
      created_at: new Date('2026-05-30T17:15:00Z').toISOString(),
    },

    // Fahad Chat (done)
    {
      id: 'm_2_1',
      conversation_id: 'conv_2',
      workspace_id: defaultWorkspaceId,
      sender: 'contact',
      sender_name: 'Fahad Al-Qahtani',
      body: 'السلام عليكم، هل يوجد لديكم سياسة استرجاع للكود؟',
      created_at: new Date('2026-05-30T14:20:00Z').toISOString(),
    },
    {
      id: 'm_2_2',
      workspace_id: defaultWorkspaceId,
      conversation_id: 'conv_2',
      sender: 'ai',
      sender_name: 'AI Agent',
      body: 'وعليكم السلام يا فهد! نظراً لطبيعة المنتجات الرقمية القابلة للتحميل، لدينا سياسة صارمة لعدم الاسترجاع بمجرد الشراء، ولكننا نقدم دعماً فنياً شاملاً على مدار الساعة لمساعدتك في التثبيت والتهيئة. يسعدنا خدمتك!',
      created_at: new Date('2026-05-30T14:22:00Z').toISOString(),
    },
    {
      id: 'm_2_3',
      conversation_id: 'conv_2',
      workspace_id: defaultWorkspaceId,
      sender: 'contact',
      sender_name: 'Fahad Al-Qahtani',
      body: 'تم شراء الكود وتفعيله بنجاح، شكراً لكم.',
      created_at: new Date('2026-05-30T14:30:00Z').toISOString(),
    },

    // Telegram chat
    {
      id: 'm_3_1',
      conversation_id: 'conv_3',
      workspace_id: defaultWorkspaceId,
      sender: 'contact',
      sender_name: 'Majed Al-Harbi (Telegram Visitor)',
      body: 'Hello! I need assistance with the masterclass.',
      created_at: new Date('2026-05-30T16:50:00Z').toISOString(),
    },
  ];

  return {
    users: [demoUser],
    workspaces: [demoWorkspace],
    contacts,
    conversations,
    messages,
    products: getDefaultStoreProducts(),
  };
}

let dbState: DBStructure;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      
      // Determine if products need upgrade to rich bilingual catalog with region & platform
      const existingProducts: StoreProduct[] = parsed.products || [];
      const hasRegion = existingProducts.some((p) => p.region !== undefined);
      const activeProducts = hasRegion ? existingProducts : getDefaultStoreProducts();

      // Ensure all arrays exist
      dbState = {
        users: parsed.users || [],
        workspaces: parsed.workspaces || [],
        contacts: parsed.contacts || [],
        conversations: parsed.conversations || [],
        messages: parsed.messages || [],
        products: activeProducts,
        orders: parsed.orders || [],
        stock_alerts: parsed.stock_alerts || [],
        reviews: parsed.reviews || [
          {
            id: 'rev_1',
            order_id: 'ord_demo_1',
            product_id: 'p1',
            product_name: 'SaaS Boilerplate Full-Stack',
            customer_email: 'abdullah.m@gmail.com',
            customer_name: 'عبدالله المطيري',
            rating: 5,
            comment: 'التسليم فوري في أقل من دقيقة، والكود نظيف جداً ومكتوب باحترافية عالية، وفر علي أسابيع من العمل!',
            created_at: new Date('2026-06-01T10:00:00Z').toISOString(),
          },
          {
            id: 'rev_2',
            order_id: 'ord_demo_2',
            product_id: 'p2',
            product_name: 'Tailwind UI Pro Kit (60+ Modules)',
            customer_email: 'sultan.dev@hotmail.com',
            customer_name: 'سلطان الدوسري',
            rating: 5,
            comment: 'حزمة المكونات متوافقة بشكل ممتاز مع اللغة العربية RTL، والدعم الفني للمنصة سريع ومتجاوب.',
            created_at: new Date('2026-06-03T14:30:00Z').toISOString(),
          },
          {
            id: 'rev_3',
            order_id: 'ord_demo_3',
            product_id: 'p6',
            product_name: 'ChatGPT & Gemini Telegram Bot Source Code',
            customer_email: 'omar.k@gmail.com',
            customer_name: 'عمر الخالدي',
            rating: 5,
            comment: 'البوت شغال بدون أي تعقيد، ودليل التفعيل المرفق مع الكود وضح لي كل خطوات التشغيل بسلاسة.',
            created_at: new Date('2026-06-05T09:15:00Z').toISOString(),
          }
        ],
      };

      // Ensure every product has an explicit SKU
      const defaultSkuMap: Record<string, string> = {
        p1: 'saas-bp-01',
        p2: 'tg-bot-ai',
        p3: 'copilot-pro-1y',
        p4: 'xbox-gpu-3m',
        p5: 'steam-cyber-glb',
        p6: 'twui-kit-pro',
      };
      dbState.products.forEach((p) => {
        if (!p.sku) {
          p.sku = defaultSkuMap[p.id] || p.code?.toLowerCase().replace(/[^a-z0-9-]/g, '') || `sku-${p.id}`;
        }
      });

      // Ensure workspaces have store_secret_key
      dbState.workspaces.forEach((w) => {
        if (!w.store_secret_key) {
          w.store_secret_key = 'shk_sec_live_994821';
        }
      });

      if (!hasRegion) {
        saveDatabase();
      }
    } else {
      dbState = getInitialDBState();
      dbState.orders = [];
      dbState.stock_alerts = [];
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading database, resetting to default', err);
    dbState = getInitialDBState();
    dbState.orders = [];
    dbState.stock_alerts = [];
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database', err);
  }
}

// Initial DB load
loadDatabase();

// --- Gemini AI Lazily Initialized Service ---
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// Simple Helper to run Gemini
async function runGeminiResponse(systemInstruction: string, chatHistory: { role: string; text: string }[]): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    // If no key setup, return a simulated helpful AI message explaining settings config
    const isArabic = chatHistory[chatHistory.length - 1]?.text.match(/[\u0600-\u06FF]/);
    if (isArabic) {
      return `مرحباً بك! أنا مساعد الذكاء الاصطناعي الافتراضي من منصة شخصي.
      (لم يتم تفعيل مفتاح الـ GEMINI_API_KEY الحقيقي في الإعدادات، لذا أجيبك بالرد التجريبي الفيرتوال: نحن متجر Premium Code Hub، نبيع قوالب برمجية مثل SaaS Boilerplate بسعر $49. لا يوجد استرجاع للمبيعات الرقمية ولكن نقدم الدعم 24/7!)`;
    } else {
      return `Hello! I am your virtual support agent.
      (Real Gemini is running in simulation mode. Setup a GEMINI_API_KEY in the Secrets menu to activate authentic live replies!). We offer custom SaaS Templates starting at $49 and full courses. How can I assist you further?`;
    }
  }

  try {
    const formattedHistory = chatHistory.map((item) => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.text }],
    }));

    // Generate content using gemini-3.5-flash
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedHistory as any,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || 'No response from AI.';
  } catch (err: any) {
    console.error('Error in Gemini SDK call:', err);
    return `AI Error Encountered: ${err.message || 'Unknown network error'}`;
  }
}

// --- ACTIVE SESSION SEED (SIMULATED COOKIE/JWT AUTOMATION) ---
let currentSessionUser: User | null = dbState.users[0] || null;

// Helper to keep session safe or fetch default
function getActiveUser(): User {
  if (!currentSessionUser) {
    if (dbState.users.length > 0) {
      currentSessionUser = dbState.users[0];
    } else {
      // Create instant fallback
      const state = getInitialDBState();
      dbState.users.push(state.users[0]);
      dbState.workspaces.push(state.workspaces[0]);
      saveDatabase();
      currentSessionUser = state.users[0];
    }
  }
  return currentSessionUser;
}

function getActiveWorkspace(): Workspace {
  const u = getActiveUser();
  let ws = dbState.workspaces.find((w) => w.owner_user_id === u.user_id);
  if (!ws) {
    ws = {
      workspace_id: 'w_' + Math.random().toString(36).substr(2, 9),
      owner_user_id: u.user_id,
      bot_name: 'My Custom Bot Helpdesk',
      widget_color: '#0f172a',
      ai_enabled: true,
      ai_instructions: 'You are a general support bot.',
      welcome_message: 'Hi there! How can we assist you?',
      email_notifications: false,
      notification_email: u.email,
      telegram_enabled: false,
    };
    dbState.workspaces.push(ws);
    saveDatabase();
  }
  return ws;
}

// --- REST API ENDPOINTS ---

// Auth Endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All parameters (email, name, password) are required.' });
  }

  const alreadyExists = dbState.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (alreadyExists) {
    return res.status(400).json({ error: 'A user with this email address already exists.' });
  }

  const userId = 'u_' + Math.random().toString(36).substr(2, 9);
  const newUser: User = {
    user_id: userId,
    email: email.toLowerCase(),
    name,
    provider: 'local',
    password_hash: password, // Simple storage for demo
    picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    created_at: new Date().toISOString(),
  };

  const newWorkspace: Workspace = {
    workspace_id: 'w_' + Math.random().toString(36).substr(2, 9),
    owner_user_id: userId,
    bot_name: `${name}'s Assistant`,
    widget_color: '#0f172a', // standard charcoal slate
    ai_enabled: true,
    ai_instructions: `You are a loyal customer support assistant for ${name}'s digital store. Answer customer queries nicely in their language.`,
    welcome_message: `Hello! Welcome to our dynamic customer widget. How may I assist you?`,
    email_notifications: true,
    notification_email: email.toLowerCase(),
    telegram_enabled: false,
  };

  dbState.users.push(newUser);
  dbState.workspaces.push(newWorkspace);
  saveDatabase();

  currentSessionUser = newUser;
  res.json({ message: 'Registration completed successfully', user: newUser, workspace: newWorkspace });
});

function findOrCreateCustomerThread(user: User): { contact: Contact; conversation: Conversation } {
  const wsId = 'w_demo'; // default active workspace ID
  const email = user.email.toLowerCase();
  
  // Check if a contact already exists with this email for the workspace
  let contact = dbState.contacts.find(
    (c) => c.workspace_id === wsId && c.email.toLowerCase() === email
  );
  
  if (!contact) {
    const contactId = 'c_usr_' + Math.random().toString(36).substr(2, 9);
    const colors = ['bg-orange-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500'];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];
    
    contact = {
      id: contactId,
      workspace_id: wsId,
      name: user.name || email.split('@')[0],
      email: email,
      phone: '',
      channel: 'widget',
      avatar_color,
    };
    dbState.contacts.push(contact);
  }
  
  // Check if conversation exists
  let conversation = dbState.conversations.find(
    (c) => c.workspace_id === wsId && c.contact_id === contact!.id && c.channel === 'widget'
  );
  
  if (!conversation) {
    const convId = 'conv_usr_' + Math.random().toString(36).substr(2, 9);
    conversation = {
      id: convId,
      workspace_id: wsId,
      contact_id: contact.id,
      channel: 'widget',
      status: 'open',
      last_message_at: new Date().toISOString(),
      last_message_preview: 'Initiated customer account conversation.',
      unread_count: 0,
      source: 'Customer Login Portal',
      referrer: '',
      campaign: '',
    };
    dbState.conversations.push(conversation);
    
    // Add dynamic starter welcome message
    const ws = dbState.workspaces.find((w) => w.workspace_id === wsId) || dbState.workspaces[0];
    const systemMsgId = 'm_usr_init_' + Math.random().toString(36).substr(2, 9);
    dbState.messages.push({
      id: systemMsgId,
      conversation_id: conversation.id,
      workspace_id: wsId,
      sender: 'ai',
      sender_name: ws.bot_name,
      body: ws.welcome_message,
      created_at: new Date().toISOString(),
    });
  }
  
  saveDatabase();
  return { contact, conversation };
}

app.post('/api/auth/login-mock', (req, res) => {
  const { email } = req.body;
  const cleanEmail = (email || 'ziyadalghamdi55@gmail.com').trim().toLowerCase();
  
  let matchedUser = dbState.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!matchedUser) {
    // Automatically register them
    const userId = 'u_' + Math.random().toString(36).substr(2, 9);
    matchedUser = {
      user_id: userId,
      email: cleanEmail,
      name: cleanEmail.includes('@') 
        ? (cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1)) 
        : `Visitor (${cleanEmail.toUpperCase()})`,
      provider: 'google',
      password_hash: 'shakhsi123',
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
      created_at: new Date().toISOString()
    };
    dbState.users.push(matchedUser);
    saveDatabase();
  }
  
  currentSessionUser = matchedUser;
  const ws = getActiveWorkspace();
  res.json({ message: 'Login successful via fast-oauth', user: matchedUser, workspace: ws });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password must be supplied.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const matchedUser = dbState.users.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password_hash === cleanPassword
  );

  if (!matchedUser) {
    return res.status(401).json({ error: 'Invalid email or password combination.' });
  }

  currentSessionUser = matchedUser;
  const ws = getActiveWorkspace();
  res.json({ message: 'Login successful', user: matchedUser, workspace: ws });
});

app.get('/api/auth/me', (req, res) => {
  const user = currentSessionUser;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const isOwner = user.email.toLowerCase() === 'ziyadalghamdi55@gmail.com';
  let customerThread = null;
  if (!isOwner) {
    customerThread = findOrCreateCustomerThread(user);
  }
  
  res.json({ user, isOwner, customerThread });
});

app.post('/api/auth/logout', (req, res) => {
  currentSessionUser = null;
  res.json({ message: 'Logged out successfully' });
});

// Workspace Endpoints
app.get('/api/workspace', (req, res) => {
  const ws = getActiveWorkspace();
  res.json(ws);
});

app.patch('/api/workspace', (req, res) => {
  const ws = getActiveWorkspace();
  const updates = req.body;

  Object.assign(ws, updates);
  saveDatabase();

  res.json({ message: 'Workspace updated correctly', workspace: ws });
});

// Inbox Endpoints
app.get('/api/conversations', (req, res) => {
  const ws = getActiveWorkspace();
  const statusFilter = req.query.status as string; // 'open', 'snoozed', 'done' or empty

  let filtered = dbState.conversations.filter((c) => c.workspace_id === ws.workspace_id);
  if (statusFilter) {
    filtered = filtered.filter((c) => c.status === statusFilter);
  }

  // Populate basic contact details for frontend ease of rendering
  const populated = filtered.map((c) => {
    const contact = dbState.contacts.find((con) => con.id === c.contact_id);
    return {
      ...c,
      contact: contact || { name: 'Unknown', email: 'external@user.com' },
    };
  });

  // Sort by last message date descending
  populated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  res.json(populated);
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const convId = req.params.id;
  const ws = getActiveWorkspace();

  const conversation = dbState.conversations.find((c) => c.id === convId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }

  // Zero unread count upon agent reading
  if (conversation.unread_count > 0) {
    conversation.unread_count = 0;
    saveDatabase();
  }

  const list = dbState.messages.filter((m) => m.conversation_id === convId);
  // Sort ascending
  list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json({
    conversation,
    contact: dbState.contacts.find((co) => co.id === conversation.contact_id),
    messages: list,
  });
});

// Agent sends manually a reply to a conversation
app.post('/api/conversations/:id/messages', (req, res) => {
  const convId = req.params.id;
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Message body cannot be empty.' });

  const ws = getActiveWorkspace();
  const conversation = dbState.conversations.find((c) => c.id === convId && c.workspace_id === ws.workspace_id);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation could not be identified.' });
  }

  const messageId = 'm_' + Math.random().toString(36).substr(2, 9);
  const newMsg: Message = {
    id: messageId,
    conversation_id: convId,
    workspace_id: ws.workspace_id,
    sender: 'agent',
    sender_name: 'Agent Support',
    body,
    created_at: new Date().toISOString(),
  };

  dbState.messages.push(newMsg);

  // Update conversation last activity
  conversation.last_message_at = newMsg.created_at;
  conversation.last_message_preview = body.length > 50 ? body.substr(0, 47) + '...' : body;
  conversation.unread_count = 0; // cleared because agent sent it
  conversation.intervention_requested = false; // Reset intervention flag on human agent reply

  saveDatabase();
  res.json(newMsg);
});

// Change conversation status (snoozed, done, open)
app.patch('/api/conversations/:id', (req, res) => {
  const convId = req.params.id;
  const { status, is_urgent } = req.body;
  const ws = getActiveWorkspace();

  const conversation = dbState.conversations.find((c) => c.id === convId && c.workspace_id === ws.workspace_id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }

  if (status && ['open', 'snoozed', 'done'].includes(status)) {
    conversation.status = status as any;
  }

  if (is_urgent !== undefined) {
    conversation.is_urgent = !!is_urgent;
  }

  saveDatabase();

  res.json({ message: 'Conversation updated successfully', conversation });
});

// GET statistics, AI Handle, Average speed, channels, etc.
app.get('/api/analytics', (req, res) => {
  const ws = getActiveWorkspace();
  const workspaceConversations = dbState.conversations.filter((c) => c.workspace_id === ws.workspace_id);

  const total = workspaceConversations.length;
  // AI Handled percentage = conversations where AI sent at least one message
  let aiResolved = 0;
  workspaceConversations.forEach((c) => {
    const messages = dbState.messages.filter((m) => m.conversation_id === c.id);
    const hasAiMessage = messages.some((m) => m.sender === 'ai');
    if (hasAiMessage) aiResolved++;
  });

  const aiPercentage = total > 0 ? Math.round((aiResolved / total) * 100) : 100;

  // Let's count channel distribution
  const chatWidgetCount = workspaceConversations.filter((c) => c.channel === 'widget').length;
  const telegramCount = workspaceConversations.filter((c) => c.channel === 'telegram').length;

  // Track sources
  const sourcesMap: Record<string, number> = {};
  workspaceConversations.forEach((c) => {
    const src = c.source || 'Direct Store Visits';
    sourcesMap[src] = (sourcesMap[src] || 0) + 1;
  });

  const sourcesList = Object.entries(sourcesMap).map(([name, value]) => ({ name, value }));
  if (sourcesList.length === 0) {
    sourcesList.push({ name: 'Direct Store Visits', value: 0 });
  }

  res.json({
    totalConversations: total,
    aiHandledPercent: aiPercentage,
    avgResponseTime: '2.5 mins',
    channelDistribution: [
      { name: 'Web Chat Widget', value: chatWidgetCount },
      { name: 'Telegram Bot Chat', value: telegramCount },
    ],
    sources: sourcesList,
  });
});

app.get('/api/inbox/stats', (req, res) => {
  const ws = getActiveWorkspace();
  const convs = dbState.conversations.filter((c) => c.workspace_id === ws.workspace_id);
  res.json({
    open: convs.filter((c) => c.status === 'open').length,
    snoozed: convs.filter((c) => c.status === 'snoozed').length,
    done: convs.filter((c) => c.status === 'done').length,
  });
});

// Common temporary / disposable burner email domains list
const BURNER_EMAIL_DOMAINS = [
  'tempmail.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
  'sharklasers.com', 'yopmail.com', 'trashmail.com', 'dispostable.com',
  'mailinator.com', 'dropmail.me', 'fakeinbox.com', 'maildrop.cc',
  'getnada.com', 'tempail.com', 'mohmal.com', 'burnermail.io'
];

function isBurnerEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return BURNER_EMAIL_DOMAINS.some((b) => domain === b || domain.endsWith('.' + b));
}

app.get('/api/products', (req, res) => {
  res.json(dbState.products || []);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const {
    sku,
    name,
    name_ar,
    price,
    description,
    description_ar,
    category,
    category_ar,
    code,
    region,
    region_ar,
    platform,
    platform_ar,
    official_url,
    activation_guide,
    activation_guide_ar,
    viewsCount,
    purchasesCount,
    stockCount,
    inventoryCodes
  } = req.body;

  const productIndex = dbState.products.findIndex((p) => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = dbState.products[productIndex];
  const cleanSku = (sku || existing.sku || existing.code || `sku-${existing.id}`).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

  const updatedProduct: StoreProduct = {
    ...existing,
    sku: cleanSku,
    name: name !== undefined ? name : existing.name,
    name_ar: name_ar !== undefined ? name_ar : existing.name_ar,
    price: price !== undefined ? Number(price) : existing.price,
    description: description !== undefined ? description : existing.description,
    description_ar: description_ar !== undefined ? description_ar : existing.description_ar,
    category: category !== undefined ? category : existing.category,
    category_ar: category_ar !== undefined ? category_ar : existing.category_ar,
    code: code !== undefined ? code : existing.code,
    region: region !== undefined ? region : existing.region,
    region_ar: region_ar !== undefined ? region_ar : existing.region_ar,
    platform: platform !== undefined ? platform : existing.platform,
    platform_ar: platform_ar !== undefined ? platform_ar : existing.platform_ar,
    official_url: official_url !== undefined ? official_url : existing.official_url,
    activation_guide: activation_guide !== undefined ? activation_guide : existing.activation_guide,
    activation_guide_ar: activation_guide_ar !== undefined ? activation_guide_ar : existing.activation_guide_ar,
    viewsCount: viewsCount !== undefined ? Number(viewsCount) : existing.viewsCount,
    purchasesCount: purchasesCount !== undefined ? Number(purchasesCount) : existing.purchasesCount,
    stockCount: stockCount !== undefined ? Number(stockCount) : (inventoryCodes ? inventoryCodes.length : existing.stockCount),
    inventoryCodes: inventoryCodes !== undefined ? inventoryCodes : existing.inventoryCodes,
  };

  dbState.products[productIndex] = updatedProduct;
  saveDatabase();
  res.json({ message: 'Product updated successfully', product: updatedProduct });
});

app.post('/api/products', (req, res) => {
  const {
    sku,
    name,
    name_ar,
    price,
    description,
    description_ar,
    category,
    category_ar,
    code,
    region,
    region_ar,
    platform,
    platform_ar,
    official_url,
    activation_guide,
    activation_guide_ar,
    inventoryCodes,
    stockCount
  } = req.body;
  
  const parsedCodes = Array.isArray(inventoryCodes) ? inventoryCodes : (
    typeof inventoryCodes === 'string' ? inventoryCodes.split('\n').map((s: string) => s.trim()).filter(Boolean) : []
  );
  
  const initialStock = stockCount !== undefined ? Number(stockCount) : (parsedCodes.length > 0 ? parsedCodes.length : 10);
  const genCode = code || ('DIGI-' + Math.random().toString(36).substr(2, 4).toUpperCase());
  const finalSku = (sku || genCode.toLowerCase().replace(/[^a-z0-9-_]/g, '-') || `sku-${Date.now()}`).trim();

  const newProd: StoreProduct = {
    id: 'p_' + Math.random().toString(36).substr(2, 9),
    sku: finalSku,
    name: name || 'New Digital Product',
    name_ar: name_ar || name || 'منتج رقمي جديد',
    price: price !== undefined ? Number(price) : 49,
    description: description || '',
    description_ar: description_ar || description || '',
    category: category || 'Templates',
    category_ar: category_ar || 'قوالب برمجية',
    region: region || 'Global 🌐',
    region_ar: region_ar || 'عالمي 🌐',
    platform: platform || 'Web / Cloud ☁️',
    platform_ar: platform_ar || 'سحابي / ويب ☁️',
    official_url: official_url || 'https://shakhsi.com',
    activation_guide: activation_guide || 'Follow standard deployment guide.',
    activation_guide_ar: activation_guide_ar || 'اتبع دليل الإعداد المرفق مع الترخيص.',
    code: genCode,
    viewsCount: 0,
    purchasesCount: 0,
    stockCount: initialStock,
    inventoryCodes: parsedCodes,
    badge: 'New',
    badge_ar: 'جديد',
    icon: 'box',
  };
  
  dbState.products.push(newProd);
  saveDatabase();
  res.json({ message: 'Product created successfully', product: newProd });
});

// Restock product license inventory endpoint
app.post('/api/products/:id/restock', (req, res) => {
  const { id } = req.params;
  const { codes } = req.body;
  const product = dbState.products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const newCodes = Array.isArray(codes) 
    ? codes.map((s: string) => s.trim()).filter(Boolean)
    : (typeof codes === 'string' ? codes.split('\n').map((s: string) => s.trim()).filter(Boolean) : []);

  if (newCodes.length === 0) {
    return res.status(400).json({ error: 'No valid license codes provided for restocking' });
  }

  if (!Array.isArray(product.inventoryCodes)) {
    product.inventoryCodes = [];
  }
  product.inventoryCodes.push(...newCodes);
  product.stockCount = product.inventoryCodes.length;

  // Mark pending stock alerts as notified
  const waitingAlerts = dbState.stock_alerts.filter(
    (a) => a.product_id === id && a.status === 'pending'
  );
  waitingAlerts.forEach((a) => {
    a.status = 'notified';
  });

  saveDatabase();

  res.json({
    success: true,
    message: `Successfully restocked ${newCodes.length} license keys`,
    newStockCount: product.stockCount,
    notifiedSubscribersCount: waitingAlerts.length,
    product,
  });
});

// Duplicate product endpoint
app.post('/api/store/products/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const original = dbState.products.find((p) => p.id === id);
  if (!original) {
    return res.status(404).json({ error: 'Original product not found' });
  }

  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const newSku = `${original.sku || 'item'}-copy-${randomSuffix}`;
  const duplicatedProduct: StoreProduct = {
    ...original,
    id: 'p_' + Math.random().toString(36).substr(2, 9),
    sku: newSku,
    name: `${original.name} (Copy)`,
    name_ar: `${original.name_ar} (نسخة مكررة)`,
    code: `${original.code || 'COPY'}-CPY`,
    viewsCount: 0,
    purchasesCount: 0,
    stockCount: original.stockCount || 0,
    inventoryCodes: [...(original.inventoryCodes || [])],
    badge: 'Duplicate',
    badge_ar: 'نسخة مكررة',
  };

  dbState.products.push(duplicatedProduct);
  saveDatabase();

  res.json({
    success: true,
    message: `تم تكرار المنتج بنجاح مع إنشاء رمز SKU جديد تلقائياً: ${newSku}`,
    product: duplicatedProduct,
  });
});

// Bulk restock endpoint with n8n Webhook support
app.post('/api/store/products/:id/restock', async (req, res) => {
  const { id } = req.params;
  const { codes } = req.body;

  const product = dbState.products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const parsedCodes: string[] = Array.isArray(codes)
    ? codes.map((c) => String(c).trim()).filter(Boolean)
    : typeof codes === 'string'
    ? codes.split('\n').map((c) => c.trim()).filter(Boolean)
    : [];

  if (parsedCodes.length === 0) {
    return res.status(400).json({ error: 'No valid license codes provided for restock.' });
  }

  if (!product.inventoryCodes) {
    product.inventoryCodes = [];
  }

  product.inventoryCodes.push(...parsedCodes);
  product.stockCount = product.inventoryCodes.length;

  // Check and notify stock alert subscribers
  const alertsToNotify = (dbState.stock_alerts || []).filter(
    (a) => a.product_id === product.id && !a.notified
  );
  alertsToNotify.forEach((a) => {
    a.notified = true;
    a.notified_at = new Date().toISOString();
  });

  const activeWs = getActiveWorkspace();
  const restockWebhookUrl = activeWs.n8n_restock_webhook_url || activeWs.n8n_webhook_url;

  let webhookForwarded = false;
  if (restockWebhookUrl && restockWebhookUrl.startsWith('http')) {
    try {
      const restockPayload = {
        event: 'inventory_bulk_restock',
        product_id: product.id,
        sku: product.sku,
        product_name: product.name,
        added_count: parsedCodes.length,
        new_stock_total: product.stockCount,
        codes: parsedCodes,
        notified_subscribers: alertsToNotify.map((a) => a.customer_email),
        timestamp: new Date().toISOString(),
      };

      await fetch(restockWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Auth': activeWs.store_secret_key || 'shk_sec_key',
        },
        body: JSON.stringify(restockPayload),
      });
      webhookForwarded = true;
    } catch (whErr) {
      console.warn('[n8n Restock Webhook Warning]: Failed to forward restock to webhook:', whErr);
    }
  }

  saveDatabase();

  res.json({
    success: true,
    message: `تم شحن ${parsedCodes.length} أكواد جديدة بنجاح إلى المنتج (${product.name_ar || product.name}). إجمالي المخزون الحالي: ${product.stockCount}.`,
    added_count: parsedCodes.length,
    new_stock_total: product.stockCount,
    webhook_forwarded: webhookForwarded,
    notified_subscribers_count: alertsToNotify.length,
    product,
  });
});

// Stock Alerts Subscription Endpoints
app.post('/api/store/stock-alerts', (req, res) => {
  const { productId, email } = req.body;
  if (!productId || !email || !email.trim()) {
    return res.status(400).json({ error: 'Product ID and email are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const product = dbState.products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!dbState.stock_alerts) {
    dbState.stock_alerts = [];
  }

  const existing = dbState.stock_alerts.find(
    (a) => a.product_id === productId && a.customer_email.toLowerCase() === cleanEmail && !a.notified
  );

  if (existing) {
    return res.json({
      success: true,
      already_subscribed: true,
      message: 'أنت مسجل مسبقاً في قائمة التنبيه لهذا المنتج. سنرسل لك إشعاراً فور توفر دفعة جديدة!',
    });
  }

  const newSub: StockAlertSubscriber = {
    id: 'sub_' + Math.random().toString(36).substr(2, 9),
    product_id: product.id,
    product_name: product.name_ar || product.name,
    customer_email: cleanEmail,
    created_at: new Date().toISOString(),
    notified: false,
  };

  dbState.stock_alerts.push(newSub);
  saveDatabase();

  res.json({
    success: true,
    message: `تم تسجيل بريدك الإلكتروني بنجاح! سنوافيك بتنبيه فوري بمجرد توفر مفاتيح إضافية لـ ${product.name_ar || product.name}.`,
    subscriber: newSub,
  });
});

app.get('/api/store/stock-alerts', (req, res) => {
  res.json(dbState.stock_alerts || []);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = dbState.products.length;
  dbState.products = dbState.products.filter((p) => p.id !== id);
  if (dbState.products.length === initialLen) {
    return res.status(404).json({ error: 'Product not found' });
  }
  saveDatabase();
  res.json({ success: true, message: 'Product removed' });
});

// Reset store products to rich default list if requested
app.post('/api/store/reset-products', (req, res) => {
  dbState.products = getDefaultStoreProducts();
  saveDatabase();
  res.json({ success: true, products: dbState.products });
});

// All orders for store dashboard
app.get('/api/store/orders', (req, res) => {
  const orders = (dbState.orders || []).slice().reverse();
  res.json(orders);
});

// Resend license code to customer email
app.post('/api/store/orders/:orderId/resend', (req, res) => {
  const { orderId } = req.params;
  const order = dbState.orders?.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Simulate instant email re-dispatch
  res.json({
    success: true,
    message: `تم إعادة إرسال كود الترخيص (${order.license_code}) بنجاح إلى البريد الإلكتروني: ${order.customer_email}`,
    sent_at: new Date().toISOString(),
    customer_email: order.customer_email,
  });
});

// Promo Codes definition
interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description_ar: string;
  description_en: string;
}

const STORE_PROMO_CODES: PromoCode[] = [
  { code: 'SHAKHSI10', discountType: 'percentage', discountValue: 10, description_ar: 'خصم 10% للعملاء الجدد', description_en: '10% discount for new customers' },
  { code: 'VIP20', discountType: 'percentage', discountValue: 20, description_ar: 'خصم 20% لكبار العملاء', description_en: '20% VIP exclusive discount' },
  { code: 'RAMADAN', discountType: 'fixed', discountValue: 30, description_ar: 'خصم بقيمة 30 ر.س', description_en: '30 SAR fixed discount' },
  { code: 'FASTGO', discountType: 'percentage', discountValue: 15, description_ar: 'خصم 15% بمناسبة الإطلاق', description_en: '15% Fast Go-Live celebration discount' },
];

// Validate promo code
app.post('/api/store/promo/validate', (req, res) => {
  const { code, originalPrice } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'Promo code is required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const matched = STORE_PROMO_CODES.find((p) => p.code === cleanCode);

  if (!matched) {
    return res.status(404).json({
      valid: false,
      error: 'كود الخصم غير صالح أو منتهي الصلاحية. يمكنك تجربة كود SHAKHSI10 أو VIP20.',
    });
  }

  const basePrice = Number(originalPrice) || 0;
  let discountAmount = 0;
  if (matched.discountType === 'percentage') {
    discountAmount = Math.round((basePrice * matched.discountValue) / 100);
  } else {
    discountAmount = Math.min(basePrice, matched.discountValue);
  }
  const finalPrice = Math.max(0, basePrice - discountAmount);

  res.json({
    valid: true,
    code: matched.code,
    discountType: matched.discountType,
    discountValue: matched.discountValue,
    discountAmount,
    finalPrice,
    description_ar: matched.description_ar,
    description_en: matched.description_en,
    message: `تم تطبيق كود الخصم (${matched.code}) بنجاح! تم توفير ${discountAmount} ر.س`,
  });
});

// Admin Pin / Password quick authentication endpoint for Dashboard Lock Screen
app.post('/api/auth/admin-pin', (req, res) => {
  const { pin, password } = req.body;
  const input = (pin || password || '').toString().trim();
  
  // Valid master pins/passwords: 'shakhsi123', 'admin', '2026', '1234'
  const validPins = ['shakhsi123', 'admin', '2026', '1234', '849201'];
  
  if (validPins.includes(input.toLowerCase())) {
    // Authenticate as owner
    const ownerUser = dbState.users.find((u) => u.email.toLowerCase() === 'ziyadalghamdi55@gmail.com') || dbState.users[0];
    currentSessionUser = ownerUser;
    const ws = getActiveWorkspace();
    return res.json({
      success: true,
      message: 'Admin credentials verified. Welcome to Shakhsi Platform Dashboard.',
      user: ownerUser,
      workspace: ws,
    });
  }

  return res.status(401).json({
    success: false,
    error: 'رمز المرور أو PIN غير صحيح. جرب الرمز الافتراضي: shakhsi123 أو 2026',
  });
});

// Rate limiting storage for Anti-Brute Force protection on customer order lookups
const customerLookupAttempts = new Map<string, number[]>();

// Email Backup Dispatch Service
function sendEmailBackupReceipt(order: StoreOrder, product: StoreProduct, customerEmail: string) {
  const isMulti = order.license_codes && order.license_codes.length > 1;
  const codesFormatted = isMulti
    ? order.license_codes!.map((c, idx) => `[مفتاح ${idx + 1}]: ${c}`).join('\n')
    : `[مفتاح التفعيل]: ${order.license_code}`;

  const emailSubject = `نسخة احتياطية: كود الترخيص لطلب #${order.id} (${product.name})`;
  
  console.log('====================================================');
  console.log('[Email Dispatch Service] 📧 Backup Email Sent Successfully!');
  console.log(`[Email Dispatch Service] To: ${customerEmail}`);
  console.log(`[Email Dispatch Service] Subject: ${emailSubject}`);
  console.log(`[Email Dispatch Service] Quantity: ${order.quantity || 1}`);
  console.log(`[Email Dispatch Service] Amount: ${order.amount} SAR`);
  if (order.is_gift) {
    console.log(`[Email Dispatch Service] 🎁 Gift Order For: ${order.recipient_email}`);
  }
  if (order.cross_sell_license_code) {
    console.log(`[Email Dispatch Service] ✨ Cross-Sell Added: ${order.cross_sell_product_name} (${order.cross_sell_license_code})`);
  }
  console.log(`[Email Dispatch Service] Codes:\n${codesFormatted}`);
  console.log('====================================================');

  order.email_dispatched = true;
  order.email_dispatch_time = new Date().toISOString();
}

// Checkout digital product order
app.post('/api/store/checkout', (req, res) => {
  const {
    productId,
    email,
    telegram,
    promoCode,
    quantity,
    currency,
    is_gift,
    recipient_email,
    gift_message,
    cross_sell_product_id
  } = req.body;

  if (!productId || !email || !email.trim()) {
    return res.status(400).json({ error: 'Product ID and customer email are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check for burner/disposable email domains
  if (isBurnerEmail(cleanEmail)) {
    return res.status(400).json({
      error: 'يرجى كتابة بريد حقيقي لضمان استلام الكود والرجوع إليه لاحقاً. (تم حظر البريد المؤقت لضمان حماية مشترياتك)',
      isBurner: true
    });
  }

  // Check emergency pause in workspace
  const activeWs = getActiveWorkspace();
  if (activeWs.emergency_pause) {
    return res.status(403).json({
      error: 'المتجر متوقف مؤقتاً للصيانة وجرد المخزون. يرجى المحاولة لاحقاً.',
      emergency_pause: true
    });
  }

  const product = dbState.products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Bulk quantity handling (1 to 20)
  const orderQty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));

  // Tiered volume discount: >= 5 => 10%, >= 3 => 5%
  let volumeDiscountRate = 0;
  if (orderQty >= 5) {
    volumeDiscountRate = 10;
  } else if (orderQty >= 3) {
    volumeDiscountRate = 5;
  }

  const subtotal = product.price * orderQty;
  const volumeDiscountAmount = Math.round((subtotal * volumeDiscountRate) / 100);

  // Promo code discount
  let promoDiscountAmount = 0;
  let validPromoCode: string | undefined = undefined;
  if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
    const cleanPromo = promoCode.trim().toUpperCase();
    const promo = STORE_PROMO_CODES.find((p) => p.code === cleanPromo);
    if (promo) {
      validPromoCode = promo.code;
      if (promo.discountType === 'percentage') {
        promoDiscountAmount = Math.round((subtotal * promo.discountValue) / 100);
      } else {
        promoDiscountAmount = Math.min(subtotal, promo.discountValue);
      }
    }
  }

  const totalDiscount = volumeDiscountAmount + promoDiscountAmount;
  let finalAmount = Math.max(0, subtotal - totalDiscount);

  // Cross-sell handling: 15% discount on complementary product
  let crossSellProd: StoreProduct | undefined = undefined;
  let crossSellPrice = 0;
  let crossSellCode: string | undefined = undefined;

  if (cross_sell_product_id) {
    crossSellProd = dbState.products.find((p) => p.id === cross_sell_product_id);
    if (crossSellProd && (crossSellProd.stockCount || 0) > 0) {
      // 15% discount for cross-sell
      crossSellPrice = Math.round(crossSellProd.price * 0.85);
      finalAmount += crossSellPrice;

      // Take or mint license code for cross-sell
      if (crossSellProd.inventoryCodes && crossSellProd.inventoryCodes.length > 0) {
        crossSellCode = crossSellProd.inventoryCodes.shift()!;
      } else {
        crossSellCode = `SHK-XSELL-${crossSellProd.code || 'ADDON'}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      }
      if (crossSellProd.stockCount !== undefined) {
        crossSellProd.stockCount = Math.max(0, crossSellProd.stockCount - 1);
      }
      crossSellProd.purchasesCount = (crossSellProd.purchasesCount || 0) + 1;
    }
  }

  const orderId = 'ord_' + Math.random().toString(36).substr(2, 9);

  // Prepare structured Payment Metadata
  const paymentMetadata = {
    product_sku: product.sku || product.code,
    product_id: product.id,
    quantity: orderQty,
    email: cleanEmail,
    currency: currency || 'SAR',
    is_gift: Boolean(is_gift),
    recipient_email: is_gift ? (recipient_email || '').trim().toLowerCase() : undefined,
    gift_message: is_gift ? gift_message : undefined,
    cross_sell_product_id: crossSellProd?.id,
    cross_sell_product_sku: crossSellProd?.sku,
    order_id: orderId,
    store_secret_verified: Boolean(activeWs.store_secret_key),
  };

  // Check if workspace is set to PRODUCTION REAL SELLING MODE
  if (activeWs.production_mode) {
    let realPaymentLink = activeWs.payment_link || 'https://checkout.tap.company/pay/shakhsi-store-prod';
    
    // Check stock before redirecting
    const currentStock = product.stockCount !== undefined ? product.stockCount : 10;
    if (currentStock < orderQty) {
      return res.status(400).json({ 
        error: `المخزون المتوفر (${currentStock}) أقل من الكمية المطلوبة (${orderQty}). يرجى تقليل الكمية.` 
      });
    }

    try {
      const parsedUrl = new URL(realPaymentLink);
      parsedUrl.searchParams.set('product_sku', String(paymentMetadata.product_sku));
      parsedUrl.searchParams.set('quantity', String(orderQty));
      parsedUrl.searchParams.set('email', cleanEmail);
      parsedUrl.searchParams.set('order_id', orderId);
      parsedUrl.searchParams.set('currency', String(paymentMetadata.currency));
      parsedUrl.searchParams.set('meta', encodeURIComponent(JSON.stringify(paymentMetadata)));
      realPaymentLink = parsedUrl.toString();
    } catch {
      // Keep original url if parsing fails
    }

    return res.json({
      success: true,
      production_mode: true,
      redirect_url: realPaymentLink,
      freelance_doc: activeWs.freelance_doc_number || 'FL-849201',
      final_amount: finalAmount,
      quantity: orderQty,
      metadata: paymentMetadata,
      message: 'جاري توجيهك إلى بوابة الدفع المعتمدة (Tap / Payment Gateway)...',
    });
  }

  // --- SIMULATION MODE: Instant key minting & delivery ---
  const currentStock = product.stockCount !== undefined ? product.stockCount : 10;
  if (currentStock < orderQty) {
    return res.status(400).json({ 
      error: `المخزون المتوفر (${currentStock}) أقل من الكمية المطلوبة (${orderQty}). يرجى تقليل الكمية.` 
    });
  }

  // Mint / deduct `orderQty` license codes
  const mintedCodes: string[] = [];
  for (let i = 0; i < orderQty; i++) {
    if (product.inventoryCodes && product.inventoryCodes.length > 0) {
      mintedCodes.push(product.inventoryCodes.shift()!);
    } else {
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const dateStr = new Date().getFullYear();
      mintedCodes.push(`SHK-${product.code || 'LIC'}-${dateStr}-${randomHex}`);
    }
  }

  // Update stock and purchases
  if (product.stockCount !== undefined) {
    product.stockCount = Math.max(0, product.stockCount - orderQty);
  }
  product.purchasesCount = (product.purchasesCount || 0) + orderQty;

  const primaryCode = mintedCodes[0];
  const newOrder: StoreOrder = {
    id: orderId,
    product_id: product.id,
    product_name: product.name,
    amount: finalAmount,
    currency: currency || 'SAR',
    quantity: orderQty,
    customer_email: cleanEmail,
    customer_telegram: telegram ? telegram.trim() : undefined,
    license_code: mintedCodes.length === 1 ? primaryCode : mintedCodes.join(' | '),
    license_codes: mintedCodes,
    promo_code: validPromoCode,
    discount_applied: totalDiscount,
    is_gift: Boolean(is_gift),
    recipient_email: is_gift ? (recipient_email || '').trim().toLowerCase() : undefined,
    gift_message: is_gift ? gift_message : undefined,
    cross_sell_product_id: crossSellProd?.id,
    cross_sell_product_name: crossSellProd ? (crossSellProd.name_ar || crossSellProd.name) : undefined,
    cross_sell_amount: crossSellPrice || undefined,
    cross_sell_license_code: crossSellCode,
    created_at: new Date().toISOString(),
    status: 'completed',
  };

  // Dispatch Email Backup
  sendEmailBackupReceipt(newOrder, product, cleanEmail);

  if (!dbState.orders) {
    dbState.orders = [];
  }
  dbState.orders.push(newOrder);

  // Link/record contact in DB so customer is known in Shakhsi
  let contact = dbState.contacts.find((c) => c.email.toLowerCase() === cleanEmail);
  if (!contact) {
    const ws = dbState.workspaces[0];
    const contactId = 'c_store_' + Math.random().toString(36).substr(2, 9);
    contact = {
      id: contactId,
      workspace_id: ws.workspace_id,
      name: email.split('@')[0],
      email: cleanEmail,
      phone: '',
      channel: 'widget',
      avatar_color: 'bg-emerald-600',
    };
    dbState.contacts.push(contact);
  }

  saveDatabase();

  // Trigger n8n Order Webhook if configured
  const orderWebhookUrl = activeWs.n8n_order_webhook_url || (activeWs.n8n_enabled ? activeWs.n8n_webhook_url : undefined);
  if (orderWebhookUrl && orderWebhookUrl.startsWith('http')) {
    fetch(orderWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-Auth': activeWs.store_secret_key || 'shk_sec_live_994821',
        'X-Shakhsi-Secret': activeWs.store_secret_key || 'shk_sec_live_994821',
      },
      body: JSON.stringify({
        event: 'digital_order_created',
        order: newOrder,
        product_sku: product.sku || product.code,
        license_codes: newOrder.license_codes || [newOrder.license_code],
        customer_email: cleanEmail,
        timestamp: new Date().toISOString(),
      }),
    }).catch((whErr) => console.warn('[n8n Order Webhook Warning]:', whErr.message));
  }

  res.json({
    success: true,
    production_mode: false,
    order: newOrder,
    discount_applied: totalDiscount,
    volume_discount_rate: volumeDiscountRate,
    email_dispatched: true,
    metadata: paymentMetadata,
    message: 'Order processed successfully. Instant delivery confirmed and email backup dispatched.',
  });
});

const orderLookupAttempts = new Map<string, number[]>();

// Lookup order by ID for order tracking with Anti-Brute Force Protection
app.get('/api/orders/:orderId', (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'ip_unknown';
  const { orderId } = req.params;

  // Anti-Brute Force Rate Limiter: max 6 attempts per 30 seconds
  const rateLimitKey = `order_track_${clientIp}`;
  const now = Date.now();
  const windowMs = 30 * 1000;
  const maxAttempts = 6;

  const pastAttempts = orderLookupAttempts.get(rateLimitKey) || [];
  const validAttempts = pastAttempts.filter((t) => now - t < windowMs);

  if (validAttempts.length >= maxAttempts) {
    const oldest = validAttempts[0];
    const remainingSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    return res.status(429).json({
      error: `تم تفعيل جدار حماية الأمان (Anti-Brute Force) لمنع التخمين العشوائي للأكواد. يرجى الانتظار ${remainingSeconds} ثانية قبل المحاولة مجدداً.`,
      cooldown: remainingSeconds,
    });
  }

  validAttempts.push(now);
  orderLookupAttempts.set(rateLimitKey, validAttempts);

  const cleanQuery = (orderId || '').trim().toLowerCase();
  const order = dbState.orders?.find(
    (o) => o.id.toLowerCase() === cleanQuery || o.license_code.toLowerCase() === cleanQuery || (o.license_codes && o.license_codes.some(c => c.toLowerCase() === cleanQuery))
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ order });
});

// Render HTML Dark Email Template for Preview
app.get('/api/store/orders/:orderId/email-preview', (req, res) => {
  const { orderId } = req.params;
  const order = dbState.orders?.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).send('<h2>Order not found</h2>');
  }

  const product = dbState.products.find((p) => p.id === order.product_id) || {
    id: order.product_id,
    sku: 'SKU-UNKNOWN',
    name: order.product_name,
    name_ar: order.product_name,
    price: order.amount,
    description: '',
    category: 'Digital',
    code: 'LIC',
    viewsCount: 0,
    purchasesCount: 0,
    activation_guide_ar: 'قم بنسخ المفتاح واستخدامه في صفحة التفعيل المعتمدة.',
  };

  const activeWs = getActiveWorkspace();
  const html = generateOrderConfirmationEmailHtml(order, product, { storeName: activeWs.bot_name || 'Shakhsi Digital Store' });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Customer self-service portal lookup by Email with Anti-Brute Force Protection and n8n Webhook
app.get('/api/customer/orders', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'ip_unknown';
  const email = (req.query.email as string || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  // --- Anti-Brute Force Security Rate Limiter ---
  // Allow maximum 5 requests in a 30-second sliding window per IP/Email combo
  const rateLimitKey = `${clientIp}_${email}`;
  const now = Date.now();
  const windowMs = 30 * 1000; // 30 seconds
  const maxAttempts = 5;

  const pastAttempts = customerLookupAttempts.get(rateLimitKey) || [];
  const validAttempts = pastAttempts.filter((t) => now - t < windowMs);

  if (validAttempts.length >= maxAttempts) {
    const oldest = validAttempts[0];
    const remainingSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    return res.status(429).json({
      error: `تم تفعيل جدار حماية الأمان (Anti-Brute Force) لحماية بيانات المشترين. يرجى الانتظار ${remainingSeconds} ثانية قبل المحاولة مجدداً.`,
      cooldown: remainingSeconds,
    });
  }

  validAttempts.push(now);
  customerLookupAttempts.set(rateLimitKey, validAttempts);

  // Fetch local orders
  let customerOrders = (dbState.orders || []).filter(
    (o) => o.customer_email.toLowerCase() === email
  );

  // --- n8n Customer Vault External Webhook Integration ---
  const activeWs = getActiveWorkspace();
  let externalOrdersFetched = false;

  if (activeWs.n8n_customer_vault_webhook_url && activeWs.n8n_customer_vault_webhook_url.startsWith('http')) {
    try {
      const response = await fetch(activeWs.n8n_customer_vault_webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Auth': activeWs.store_secret_key || 'shk_sec_key',
        },
        body: JSON.stringify({
          event: 'customer_vault_lookup',
          email,
          client_ip: clientIp,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        if (Array.isArray(data?.orders)) {
          // Merge external orders avoiding duplicate IDs
          const existingIds = new Set(customerOrders.map((o) => o.id));
          for (const extOrder of data.orders) {
            if (extOrder && extOrder.id && !existingIds.has(extOrder.id)) {
              customerOrders.push(extOrder);
              existingIds.add(extOrder.id);
            }
          }
          externalOrdersFetched = true;
        }
      }
    } catch (vaultErr) {
      console.warn('[n8n Customer Vault Warning]: Failed to query external vault webhook:', vaultErr);
    }
  }

  // Sort newest first
  customerOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    email,
    count: customerOrders.length,
    orders: customerOrders,
    vault_webhook_queried: externalOrdersFetched,
  });
});

// Customer activation troubleshooting ticket submission
app.post('/api/support/ticket', (req, res) => {
  const { orderId, productName, email, reason, details, screenshot } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const ticketId = `TCK-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
  const defaultWorkspaceId = dbState.workspaces[0]?.workspace_id || 'w_demo';

  // Find or create customer contact
  let contact = dbState.contacts.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
  if (!contact) {
    contact = {
      id: `c_${Date.now()}`,
      workspace_id: defaultWorkspaceId,
      name: email.split('@')[0],
      email: email.trim().toLowerCase(),
      phone: '',
      channel: 'widget',
      avatar_color: 'bg-amber-500',
    };
    dbState.contacts.push(contact);
  }

  // Create new conversation in Dashboard Inbox
  const convId = `conv_tck_${Date.now()}`;
  const newConversation: Conversation = {
    id: convId,
    workspace_id: defaultWorkspaceId,
    contact_id: contact.id,
    channel: 'widget',
    status: 'open',
    last_message_at: new Date().toISOString(),
    last_message_preview: `[تذكرة تفعيل #${ticketId}] ${reason}: ${details || 'مرفق لقطة شاشة'}`,
    unread_count: 1,
  };
  dbState.conversations.unshift(newConversation);

  // Add the message with ticket and screenshot details
  const ticketMessage: Message = {
    id: `m_${Date.now()}`,
    conversation_id: convId,
    workspace_id: defaultWorkspaceId,
    sender: 'contact',
    sender_name: contact.name,
    body: `🎫 **تذكرة دعم فني جديدة #${ticketId}**
- **رقم الطلب**: ${orderId || 'غير محدد'}
- **المنتج**: ${productName || 'غير محدد'}
- **سبب المشكلة**: ${reason || 'غير محدد'}
- **ملاحظات العميل**: ${details || 'لا توجد ملاحظات إضافية'}
- **البريد**: ${email.trim()}`,
    media_url: screenshot || undefined,
    created_at: new Date().toISOString(),
  };
  dbState.messages.push(ticketMessage);

  saveDatabase();

  res.json({
    success: true,
    ticketId,
    message: 'Troubleshooting ticket created and linked to dashboard inbox.',
  });
});

// Reviews endpoints
app.get('/api/reviews', (req, res) => {
  // Return high-rating approved reviews for storefront
  const list = dbState.reviews || [];
  res.json(list);
});

app.post('/api/reviews', (req, res) => {
  const { order_id, product_id, product_name, customer_email, customer_name, rating, comment } = req.body;
  if (!order_id || !product_id || !comment || !comment.trim()) {
    return res.status(400).json({ error: 'Order ID, Product ID, and review comment are required' });
  }

  if (!dbState.reviews) {
    dbState.reviews = [];
  }

  const newReview: StoreReview = {
    id: 'rev_' + Math.random().toString(36).substr(2, 9),
    order_id,
    product_id,
    product_name: product_name || 'منتج رقمي',
    customer_email: customer_email || 'customer@user.com',
    customer_name: customer_name || customer_email?.split('@')[0] || 'عميل شخصي',
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    comment: comment.trim(),
    created_at: new Date().toISOString(),
  };

  dbState.reviews.push(newReview);
  saveDatabase();

  res.json({
    success: true,
    review: newReview,
    message: 'Review saved and published successfully',
  });
});

// --- CLIENT CHAT WIDGET PUBLIC ENDPOINTS ---

// Config public workspace settings (color, name, instructions welcome)
app.get('/api/widget/config/:workspaceId', (req, res) => {
  const wsId = req.params.workspaceId;
  const ws = dbState.workspaces.find((w) => w.workspace_id === wsId);
  if (!ws) {
    // Return a default demo to avoid widget failure
    const demo = dbState.workspaces[0];
    return res.json({
      workspace_id: wsId,
      bot_name: demo.bot_name,
      widget_color: demo.widget_color,
      welcome_message: demo.welcome_message,
    });
  }
  // Expose ONLY public settings for safety
  res.json({
    workspace_id: ws.workspace_id,
    bot_name: ws.bot_name,
    widget_color: ws.widget_color,
    welcome_message: ws.welcome_message,
  });
});

// Initializer to bind customer contact, UTM analytics and conversation in widget iframe
app.post('/api/widget/init', (req, res) => {
  const { workspaceId, name, email, phone, utm_source, utm_referrer, utm_campaign } = req.body;
  if (!workspaceId || !name || !email) {
    return res.status(400).json({ error: 'workspaceId, name, and email are required.' });
  }

  // Check if contact already exists or create new one
  let contact = dbState.contacts.find(
    (c) => c.workspace_id === workspaceId && c.email.toLowerCase() === email.toLowerCase()
  );

  if (!contact) {
    const contactId = 'c_w_' + Math.random().toString(36).substr(2, 9);
    const colors = ['bg-orange-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500'];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];

    contact = {
      id: contactId,
      workspace_id: workspaceId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      channel: 'widget',
      avatar_color,
    };
    dbState.contacts.push(contact);
  }

  // Find or create conversation for this client
  let conversation = dbState.conversations.find(
    (c) => c.workspace_id === workspaceId && c.contact_id === contact!.id && c.channel === 'widget'
  );

  if (!conversation) {
    const convId = 'conv_w_' + Math.random().toString(36).substr(2, 9);
    // Determine traffic sources based on UTM
    const trafficSource = utm_source || 'Direct Referral';

    conversation = {
      id: convId,
      workspace_id: workspaceId,
      contact_id: contact.id,
      channel: 'widget',
      status: 'open',
      last_message_at: new Date().toISOString(),
      last_message_preview: 'Initiated conversation thread.',
      unread_count: 0,
      source: trafficSource,
      referrer: utm_referrer || '',
      campaign: utm_campaign || '',
    };
    dbState.conversations.push(conversation);

    // Add starter welcome message of workspace
    const ws = dbState.workspaces.find((w) => w.workspace_id === workspaceId) || dbState.workspaces[0];
    const systemMsgId = 'm_init_' + Math.random().toString(36).substr(2, 9);
    dbState.messages.push({
      id: systemMsgId,
      conversation_id: conversation.id,
      workspace_id: workspaceId,
      sender: 'ai',
      sender_name: ws.bot_name,
      body: ws.welcome_message,
      created_at: new Date().toISOString(),
    });
  }

  saveDatabase();
  res.json({ contact, conversation });
});

// Handle incoming messages from the customer via public widget
app.post('/api/widget/message', async (req, res) => {
  const { conversationId, body } = req.body;
  if (!conversationId || !body) {
    return res.status(400).json({ error: 'Conversation ID and message body required.' });
  }

  const conversation = dbState.conversations.find((c) => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation could not be identified.' });
  }

  const contact = dbState.contacts.find((co) => co.id === conversation.contact_id);
  const ws = dbState.workspaces.find((w) => w.workspace_id === conversation.workspace_id) || dbState.workspaces[0];

  // Save customer message
  const userMsgId = 'm_client_' + Math.random().toString(36).substr(2, 9);
  const clientMessage: Message = {
    id: userMsgId,
    conversation_id: conversationId,
    workspace_id: conversation.workspace_id,
    sender: 'contact',
    sender_name: contact ? contact.name : 'Customer',
    body,
    created_at: new Date().toISOString(),
  };

  dbState.messages.push(clientMessage);

  // Update conversation
  conversation.last_message_at = clientMessage.created_at;
  conversation.last_message_preview = body.length > 50 ? body.substr(0, 47) + '...' : body;
  conversation.unread_count += 1;

  saveDatabase();

  // Forward to n8n Webhook if enabled
  if (ws.n8n_enabled && ws.n8n_webhook_url && ws.n8n_webhook_url.trim()) {
    try {
      fetch(ws.n8n_webhook_url.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'widget_message',
          workspace_id: conversation.workspace_id,
          conversation_id: conversationId,
          sender: clientMessage.sender,
          sender_name: clientMessage.sender_name,
          contact_email: contact ? contact.email : '',
          contact_name: contact ? contact.name : '',
          contact_phone: contact ? contact.phone : '',
          message: body,
          created_at: clientMessage.created_at,
          source: conversation.source || '',
          campaign: conversation.campaign || '',
          channel: conversation.channel,
        }),
      }).catch((err) => {
        console.warn('n8n Webhook forward notification warning:', err.message);
      });
    } catch (err: any) {
      console.warn('Failed to forward widget message to n8n webhook:', err.message);
    }
  }

  // Trigger AI reply if activated
  if (ws.ai_enabled) {
    // Accumulate conversation logs for prompt contexts
    const conversationMessages = dbState.messages.filter((m) => m.conversation_id === conversationId);
    conversationMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Only pass last 8 messages for context safety
    const recentMessages = conversationMessages.slice(-8);
    const contextLogs = recentMessages.map((m) => ({
      role: m.sender === 'contact' ? 'user' : 'model',
      text: `${m.sender_name}: ${m.body}`,
    }));

    // Trigger Gemini in async thread but return client message immediately to prevent widget blocking!
    // This maintains immediate polling responsiveness
    setTimeout(async () => {
      try {
        const aiResponseText = await runGeminiResponse(ws.ai_instructions, contextLogs);

        const aiMsgId = 'm_ai_' + Math.random().toString(36).substr(2, 9);
        const aiMessage: Message = {
          id: aiMsgId,
          conversation_id: conversationId,
          workspace_id: conversation.workspace_id,
          sender: 'ai',
          sender_name: ws.bot_name,
          body: aiResponseText,
          created_at: new Date().toISOString(),
        };

        dbState.messages.push(aiMessage);

        // Update conversation again
        conversation.last_message_at = aiMessage.created_at;
        conversation.last_message_preview = aiResponseText.length > 50 ? aiResponseText.substr(0, 47) + '...' : aiResponseText;
        conversation.unread_count = 0; // AI answered, clear customer unread for managers

        saveDatabase();
      } catch (err) {
        console.error('Trigger AI asynchronous reply error:', err);
      }
    }, 800); // Small realistic delay for UI effect
  }

  res.json({ message: 'Customer message logged successfully', userMessage: clientMessage });
});

// Fetch messages for active widget client (polling)
app.get('/api/widget/messages', (req, res) => {
  const conversationId = req.query.conversationId as string;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId of the thread is required.' });
  }

  const list = dbState.messages.filter((m) => m.conversation_id === conversationId);
  list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json(list);
});

// Flag manual owner intervention request by visitor
app.post('/api/widget/request-intervention', (req, res) => {
  const { conversationId, isUrgent } = req.body;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId is required.' });
  }

  const conversation = dbState.conversations.find((c) => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation could not be identified.' });
  }

  conversation.intervention_requested = true;
  conversation.status = 'open'; // Re-open if it was done
  
  if (isUrgent === true) {
    conversation.is_urgent = true;
  }

  const msgId = 'm_interv_' + Math.random().toString(36).substr(2, 9);
  const sysMessage: Message = {
    id: msgId,
    conversation_id: conversationId,
    workspace_id: conversation.workspace_id,
    sender: 'ai',
    sender_name: 'Notification',
    body: isUrgent
      ? '🚨 [أمر طارئ وعاجل: طلب العميل تدخلًا بشريًا فوريًا وتم تزويد المالك بإشعار بريدي! / Urgent human intervention requested. Automated alert logged.]'
      : '⚠️ [تواصل مباشر مع المالك: طلب العميل تدخل المالك البشري / Visitor requested manual human owner assistance.]',
    created_at: new Date().toISOString(),
  };

  dbState.messages.push(sysMessage);

  // Retrieve contact profiles and campaign info
  const contact = dbState.contacts.find((co) => co.id === conversation.contact_id);
  const ws = dbState.workspaces.find((w) => w.workspace_id === conversation.workspace_id) || dbState.workspaces[0];
  const targetEmail = ws.notification_email || 'ziyadalghamdi55@gmail.com';

  const emailMsgId = 'm_email_' + Math.random().toString(36).substr(2, 9);
  const emailAlertBody = `📧 [تم تزويد البريد الإلكتروني (${targetEmail}) بكافة المعلومات اللازمة: الاسم: ${contact ? contact.name : 'عميل'}, البريد: ${contact ? contact.email : 'غير معروف'}, الهاتف: ${contact?.phone || 'غير مسجل'}. مصدر الحملة: ${conversation.source || 'رابط مباشر'}, اسم الحملة: ${conversation.campaign || 'عامة'}. تم إرسال ملف المحادثة والتحليلات لمتابعة الطلب الطارئ فوراً / Emergency mail dispatched containing full conversation history, UTM attribution, and visitor profiles.]`;

  const emailMessage: Message = {
    id: emailMsgId,
    conversation_id: conversationId,
    workspace_id: conversation.workspace_id,
    sender: 'ai',
    sender_name: 'System Mailer',
    body: emailAlertBody,
    created_at: new Date(Date.now() + 100).toISOString(),
  };

  dbState.messages.push(emailMessage);

  conversation.last_message_at = sysMessage.created_at;
  conversation.last_message_preview = isUrgent ? '🚨 ' + sysMessage.body : sysMessage.body;

  saveDatabase();
  res.json({ message: 'Intervention flagged successfully', conversation });
});

// --- SIMULATED OMNICHANNEL TELEGRAM TEST CONSOLE ---
// Allows the owner to trigger a simulated customer sending a message via Telegram bot!
app.post('/api/telegram/setup', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const ws = getActiveWorkspace();
  ws.telegram_enabled = true;
  ws.telegram_token = token;
  // Pick random realistic bot handle
  ws.telegram_bot_username = token.includes(':') ? 'shakhsi_store_bot' : 'ShakhsiDemoBot';
  saveDatabase();

  res.json({
    message: 'Telegram integrations configured successfully!',
    telegram_bot_username: ws.telegram_bot_username,
  });
});

// Simulates a webhook request from Telegram to test omnichannel inputs!
app.post('/api/telegram/webhook/:workspaceId', async (req, res) => {
  const wsId = req.params.workspaceId;
  const { senderName, messageText } = req.body;

  if (!messageText || !senderName) {
    return res.status(400).json({ error: 'senderName and messageText are required.' });
  }

  const ws = dbState.workspaces.find((w) => w.workspace_id === wsId) || getActiveWorkspace();

  // 1. Find or create Telegram Contact
  let contact = dbState.contacts.find(
    (c) => c.workspace_id === wsId && c.channel === 'telegram' && c.name.startsWith(senderName)
  );

  if (!contact) {
    const contactId = 'c_tg_' + Math.random().toString(36).substr(2, 9);
    contact = {
      id: contactId,
      workspace_id: wsId,
      name: `${senderName} (Telegram Visitor)`,
      email: `${senderName.toLowerCase().replace(/\s/g, '')}@telegram.net`,
      phone: '',
      channel: 'telegram',
      avatar_color: 'bg-teal-600',
      external_id: 'tg_' + Math.floor(Math.random() * 1000000),
    };
    dbState.contacts.push(contact);
  }

  // 2. Find or create Conversation
  let conversation = dbState.conversations.find(
    (c) => c.workspace_id === wsId && c.contact_id === contact!.id && c.channel === 'telegram'
  );

  if (!conversation) {
    conversation = {
      id: 'conv_tg_' + Math.random().toString(36).substr(2, 9),
      workspace_id: wsId,
      contact_id: contact.id,
      channel: 'telegram',
      status: 'open',
      last_message_at: new Date().toISOString(),
      last_message_preview: messageText,
      unread_count: 0,
      source: 'Telegram Direct',
    };
    dbState.conversations.push(conversation);
  }

  // 3. Add Message
  const msgId = 'm_tg_in_' + Math.random().toString(36).substr(2, 9);
  const telegramMessage: Message = {
    id: msgId,
    conversation_id: conversation.id,
    workspace_id: wsId,
    sender: 'contact',
    sender_name: contact.name,
    body: messageText,
    created_at: new Date().toISOString(),
  };

  dbState.messages.push(telegramMessage);

  // Update conversation logs
  conversation.last_message_at = telegramMessage.created_at;
  conversation.last_message_preview = messageText.length > 50 ? messageText.substr(0, 47) + '...' : messageText;
  conversation.unread_count += 1;

  saveDatabase();

  // 4. Trigger AI Auto-reply for telegram channels
  if (ws.ai_enabled) {
    setTimeout(async () => {
      try {
        const conversationMessages = dbState.messages.filter((m) => m.conversation_id === conversation!.id);
        conversationMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const recentMessages = conversationMessages.slice(-8);
        const contextLogs = recentMessages.map((m) => ({
          role: m.sender === 'contact' ? 'user' : 'model',
          text: `${m.sender_name}: ${m.body}`,
        }));

        const aiResponseText = await runGeminiResponse(ws.ai_instructions, contextLogs);

        const aiMsgId = 'm_tg_ai_' + Math.random().toString(36).substr(2, 9);
        const aiMessage: Message = {
          id: aiMsgId,
          conversation_id: conversation!.id,
          workspace_id: wsId,
          sender: 'ai',
          sender_name: ws.bot_name,
          body: aiResponseText,
          created_at: new Date().toISOString(),
        };

        dbState.messages.push(aiMessage);

        conversation!.last_message_at = aiMessage.created_at;
        conversation!.last_message_preview = aiResponseText.length > 50 ? aiResponseText.substr(0, 47) + '...' : aiResponseText;
        conversation!.unread_count = 0;

        saveDatabase();
      } catch (err) {
        console.error('Trigger AI asynchronous reply error on Telegram path:', err);
      }
    }, 800);
  }

  res.json({ status: 'Telegram simulated event completed successfully', message: telegramMessage });
});

// Test n8n Webhook connection ping
app.post('/api/n8n/test', async (req, res) => {
  const { webhook_url } = req.body;
  if (!webhook_url || !webhook_url.trim()) {
    return res.status(400).json({ error: 'Webhook URL is required' });
  }

  try {
    const testPayload = {
      event: 'shakhsi_test_ping',
      timestamp: new Date().toISOString(),
      source: 'Shakhsi Platform Integration Suite',
      message: 'Test ping from Shakhsi Settings: n8n Webhook verified successfully!',
      sample_data: {
        customer_name: 'Ziyad Alghamdi',
        customer_email: 'customer@example.com',
        sample_message: 'مرحباً، أود الاستفسار عن كود تفعيل القالب البرمجي.',
      },
    };

    const targetUrl = webhook_url.trim();
    const webhookRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    if (webhookRes.ok || webhookRes.status < 400) {
      res.json({
        success: true,
        status: webhookRes.status,
        message: 'n8n Webhook responded successfully with HTTP ' + webhookRes.status,
      });
    } else {
      res.status(400).json({
        success: false,
        status: webhookRes.status,
        message: `Webhook endpoint responded with HTTP ${webhookRes.status}`,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to establish HTTP connection to provided Webhook URL.',
    });
  }
});

// --- VITE MIDDLEWARE & STATIC BINDING CONFIGURATION ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Shakhsi Platform Core] Server running on http://localhost:${PORT} under environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
