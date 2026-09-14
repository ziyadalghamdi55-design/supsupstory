/**
 * Branded Luxury Dark-Theme HTML Email Template
 * Generated for order confirmations, license deliveries, and gift dispatches.
 */

import { StoreOrder, StoreProduct } from '../types';

export interface EmailTemplateOptions {
  storeName?: string;
  supportEmail?: string;
  storeUrl?: string;
}

export function generateOrderConfirmationEmailHtml(
  order: StoreOrder,
  product?: StoreProduct,
  options: EmailTemplateOptions = {}
): string {
  const storeName = options.storeName || 'Shakhsi Digital Store | متجر شخصي الرقمي';
  const supportEmail = options.supportEmail || 'support@shakhsi.app';
  const storeUrl = options.storeUrl || 'https://shakhsi.app';

  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const codesList = order.license_codes && order.license_codes.length > 0
    ? order.license_codes
    : [order.license_code];

  const codesHtml = codesList
    .map(
      (c, idx) => `
      <div style="background-color: #030712; border: 1px solid #374151; border-radius: 8px; padding: 14px 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; color: #9ca3af; font-family: monospace;">#${idx + 1}</span>
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: 800; letter-spacing: 2px; color: #10b981;">${c}</span>
      </div>
    `
    )
    .join('');

  const giftRibbonHtml = order.is_gift
    ? `
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: center; color: #ffffff;">
      <div style="font-size: 24px; margin-bottom: 4px;">🎁 إهداء خاص من صديق!</div>
      <div style="font-size: 14px; font-weight: 600; opacity: 0.95;">هذا المنتج الرقمي تم إهداؤه خصيصاً لك من قبل: ${order.customer_email}</div>
      ${
        order.gift_message
          ? `<div style="margin-top: 10px; background-color: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px 14px; font-style: italic; font-size: 13px;">"${order.gift_message}"</div>`
          : ''
      }
    </div>
  `
    : '';

  const crossSellHtml = order.cross_sell_product_name && order.cross_sell_license_code
    ? `
    <div style="background-color: #1e1b4b; border: 1px solid #4338ca; border-radius: 12px; padding: 16px 20px; margin-top: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: #a5b4fc; margin-bottom: 6px;">✨ منتج مكمل مشمول في الطلب:</div>
      <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">${order.cross_sell_product_name}</div>
      <div style="background-color: #0f172a; border: 1px dashed #6366f1; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-size: 15px; font-weight: 700; color: #818cf8; text-align: center;">
        ${order.cross_sell_license_code}
      </div>
    </div>
  `
    : '';

  const activationGuideText = order.activation_guide_ar || order.activation_guide || product?.activation_guide_ar || product?.activation_guide || 'توجه إلى الموقع الرسمي، سجل الدخول إلى حسابك، ثم اختر استرداد الرمز (Redeem Code) والصق المفتاح أعلاه.';

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد طلبك وتفاصيل كود الترخيص | Shakhsi Store</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 32px 36px; background: linear-gradient(180deg, #1f2937 0%, #111827 100%); border-bottom: 1px solid #374151; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background-color: #10b981; color: #022c22; font-size: 26px; font-weight: 900; margin-bottom: 12px;">⚡</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${storeName}</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #10b981; font-weight: 600;">تم تأكيد السداد وإصدار الترخيص الرقمي الفوري بنجاح</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              ${giftRibbonHtml}

              <!-- Greeting & Order Overview -->
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #f3f4f6;">
                مرحباً بك،<br>
                شكراً لتسوقك معنا! نرفق لك بالأسفل مفاتيح التفعيل وتفاصيل طلبك الرقمي جاهزة للاستخدام الفوري:
              </p>

              <!-- Order Summary Meta Grid -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 18px 20px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">رقم الطلب (Order ID):</td>
                  <td align="left" style="padding: 6px 0; font-size: 13px; font-family: monospace; font-weight: 700; color: #38bdf8;">#${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">المنتج:</td>
                  <td align="left" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #ffffff;">${order.product_name}</td>
                </tr>
                ${order.product_sku ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">رمز التخزين (SKU):</td>
                  <td align="left" style="padding: 6px 0; font-size: 13px; font-family: monospace; font-weight: 700; color: #e2e8f0;">${order.product_sku}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">الكمية:</td>
                  <td align="left" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #ffffff;">${order.quantity || 1} مفتاح</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">المبلغ الإجمالي المدفوع:</td>
                  <td align="left" style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #10b981;">${order.amount} ${order.currency || 'SAR'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">تاريخ العملية:</td>
                  <td align="left" style="padding: 6px 0; font-size: 12px; color: #cbd5e1;">${orderDate}</td>
                </tr>
              </table>

              <!-- Digital License Codes Box -->
              <div style="margin-bottom: 28px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                  <span style="font-size: 14px; font-weight: 800; color: #ffffff;">🔑 مفتاح التفعيل الرقمي (Digital License Key):</span>
                </div>
                ${codesHtml}
                <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 6px;">
                  احفظ هذا الكود في مكان آمن. الكود للاستخدام مرة واحدة أو حسب شروط الترخيص.
                </div>
              </div>

              ${crossSellHtml}

              <!-- Activation Guide Box -->
              <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #f59e0b; display: flex; align-items: center; gap: 8px;">
                  📖 خطوات وتوجيهات التفعيل (Activation Guide):
                </h3>
                <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.7; white-space: pre-line;">
                  ${activationGuideText}
                </p>
                ${product?.official_url ? `
                <div style="margin-top: 14px;">
                  <a href="${product.official_url}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;">
                    الانتقال لصفحة التفعيل الرسمية ↗
                  </a>
                </div>
                ` : ''}
              </div>

              <!-- Vault Self-Service CTA -->
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="${storeUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #022c22; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 800; letter-spacing: -0.2px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);">
                  فتح خزانة مشترياتي (Customer Vault)
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #090d16; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                هل واجهتك مشكلة في تفعيل الكود؟ فريق الدعم الفني جاهز لمساعدتك دائماً عبر:
                <a href="mailto:${supportEmail}" style="color: #38bdf8; text-decoration: underline;">${supportEmail}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                هذه الرسالة تم توليدها آلياً بواسطة منصة Shakhsi الرقمية. جميع الحقوق محفوظة © ${new Date().getFullYear()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
