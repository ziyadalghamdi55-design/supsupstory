/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  user_id: string;
  email: string;
  name: string;
  provider: 'local' | 'google';
  password_hash?: string;
  picture?: string;
  created_at: string;
}

export interface Workspace {
  workspace_id: string;
  owner_user_id: string;
  bot_name: string;
  widget_color: string;
  ai_enabled: boolean;
  ai_instructions: string;
  welcome_message: string;
  email_notifications: boolean;
  notification_email: string;
  telegram_enabled: boolean;
  telegram_token?: string;
  telegram_bot_username?: string;
  n8n_enabled?: boolean;
  n8n_webhook_url?: string;
  n8n_order_webhook_url?: string;
  n8n_restock_webhook_url?: string;
  n8n_customer_vault_webhook_url?: string;
  store_secret_key?: string; // مفتاح أمان الويب هوك X-Store-Auth
  emergency_pause?: boolean;
  // Fast Go-Live & Production Ready Fields
  production_mode?: boolean; // false = simulation mode, true = real selling mode
  freelance_doc_number?: string; // رقم وثيقة العمل الحر e.g. FL-928471
  tap_api_key?: string; // مفتاح API بوابة Tap (Secret Key)
  payment_link?: string; // رابط الدفع العام المعتمد
  analytics_id?: string; // معرف تتبع التحليلات e.g. G-XXXXXXX or Meta Pixel
}

export type CurrencyCode = 'SAR' | 'USD' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  name_ar: string;
  name_en: string;
  symbol_ar: string;
  symbol_en: string;
  rate: number; // relative to SAR (1 SAR = 1 SAR, 0.27 USD, 0.98 AED)
}

export interface StockAlertSubscriber {
  id: string;
  product_id: string;
  product_name: string;
  email?: string;
  customer_email?: string;
  status?: string;
  created_at: string;
  notified?: boolean;
  notified_at?: string;
}

export interface StoreReview {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  customer_email: string;
  customer_name?: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface Contact {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  phone: string;
  channel: 'widget' | 'telegram';
  external_id?: string;
  avatar_color: string;
}

export interface Conversation {
  id: string;
  workspace_id: string;
  contact_id: string;
  channel: 'widget' | 'telegram';
  status: 'open' | 'snoozed' | 'done';
  last_message_at: string;
  last_message_preview: string;
  unread_count: number;
  source?: string;
  referrer?: string;
  campaign?: string;
  intervention_requested?: boolean;
  is_urgent?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  workspace_id: string;
  sender: 'ai' | 'agent' | 'contact';
  sender_name: string;
  body: string;
  media_url?: string;
  created_at: string;
}

export type Language = 'en' | 'ar';

export interface StoreProduct {
  id: string;
  sku: string; // Mandatory SKU e.g. "yt-1m", "saas-bp-01"
  name: string;
  name_ar?: string;
  price: number;
  description: string;
  description_ar?: string;
  category: string;
  category_ar?: string;
  region?: string;
  region_ar?: string;
  platform?: string;
  platform_ar?: string;
  code: string;
  viewsCount: number;
  purchasesCount: number;
  stockCount?: number;
  inventoryCodes?: string[];
  icon?: string;
  badge?: string;
  badge_ar?: string;
  official_url?: string;
  activation_guide?: string;
  activation_guide_ar?: string;
}

export interface StoreOrder {
  id: string;
  product_id: string;
  product_sku?: string;
  product_name: string;
  amount: number;
  currency?: CurrencyCode;
  quantity?: number;
  customer_email: string;
  customer_telegram?: string;
  license_code: string;
  license_codes?: string[];
  promo_code?: string;
  discount_applied?: number;
  email_dispatched?: boolean;
  email_dispatch_time?: string;
  // Gift functionality
  is_gift?: boolean;
  recipient_email?: string;
  gift_message?: string;
  // Cross-sell item if purchased together
  cross_sell_product_id?: string;
  cross_sell_product_name?: string;
  cross_sell_amount?: number;
  cross_sell_license_code?: string;
  activation_guide?: string;
  activation_guide_ar?: string;
  created_at: string;
  status: 'completed' | 'pending';
}

export interface Dictionary {
  // Common
  appName: string;
  tagline: string;
  freeForever: string;
  ctaGetStarted: string;
  dashboard: string;
  inbox: string;
  analytics: string;
  products: string;
  orders: string;
  settings: string;
  embed: string;
  logout: string;
  login: string;
  register: string;
  email: string;
  password: string;
  name: string;
  backToLanding: string;
  arabic: string;
  english: string;
  save: string;
  savedSuccessfully: string;
  loading: string;
  sending: string;
  copied: string;

  // Landing page
  heroTitle: string;
  heroSub: string;
  brandsSection: string;
  featureTab1Title: string;
  featureTab1Desc: string;
  featureTab2Title: string;
  featureTab2Desc: string;
  featureTab3Title: string;
  featureTab3Desc: string;
  pricingTitle: string;
  pricingSub: string;
  freeTitle: string;
  freeDesc: string;
  freeFeature1: string;
  freeFeature2: string;
  freeFeature3: string;
  freeFeature4: string;
  testimonialTitle: string;
  testimonialSubtitle: string;
  testimonial1: string;
  testimonial1Author: string;
  footerRights: string;

  // Login/Register
  loginTitle: string;
  registerTitle: string;
  googleLogin: string;
  haveAccount: string;
  noAccount: string;
  alreadyHaveAccount: string;

  // Inbox
  searchConversations: string;
  statusOpen: string;
  statusSnoozed: string;
  statusDone: string;
  selectConversation: string;
  activeChat: string;
  typeMessage: string;
  send: string;
  aiHandledLabel: string;
  aiIsAssistant: string;
  agentLabel: string;
  visitorLabel: string;
  contactInfo: string;
  channelLabel: string;
  referralDetails: string;
  sourceLabel: string;
  noConversations: string;

  // Analytics
  analyticsTitle: string;
  totalConversations: string;
  aiHandledPercentage: string;
  avgResponseTime: string;
  trafficSources: string;
  utmBuilder: string;
  utmGeneratorDesc: string;
  generateLink: string;
  generatedUrlPlaceholder: string;
  copyLink: string;
  storeUrl: string;
  campaignLabel: string;

  // Settings
  settingsTitle: string;
  botConfig: string;
  botName: string;
  themeColor: string;
  welcomeMessage: string;
  aiAgentConfig: string;
  aiEnabled: string;
  aiPrompt: string;
  notifications: string;
  emailNotificationDesc: string;
  targetEmail: string;
  telegramBotConfig: string;
  telegramEnabled: string;
  telegramToken: string;
  telegramTokenDesc: string;

  // Embed
  embedTitle: string;
  embedDesc: string;
  copyIframeCode: string;

  // Widget Client
  widgetChatWithAI: string;
  widgetWelcome: string;
  widgetEnterDetails: string;
  widgetStartChat: string;
  widgetTypePlaceholder: string;
}
