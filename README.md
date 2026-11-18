# EGOIR — موقع البراند

موقع بسيط (HTML/CSS/JS) من غير أي سيرفر — يترفع على Netlify أو Vercel أو GitHub Pages مجاناً.

## تعدّل إيه؟
كل حاجة في ملف واحد: `js/config.js`
- `whatsapp`: رقمك (مثال `201012345678`) — الطلبات بتوصلك عليه.
- `products`: المنتجات والأسعار والمقاسات والمخزون. حط صورك في فولدر `images/` واكتب `image: "images/tee.jpg"`.
- `shipping`, `offer`, `reviews`, `faq`, `social`.
- `orderEndpoint` (اختياري): لينك Google Apps Script / Formspree يستقبل الطلبات JSON بدل الواتساب.

## الشيك آوت في ضغطتين
1. **اطلب الآن** على أي منتج (المقاس متختار من الكارت).
2. **تأكيد الطلب** — بيانات العميل بتتحفظ على جهازه، فمن تاني أوردر مش هيكتب حاجة.

## التشغيل محلياً
```
python3 -m http.server 8000
```
وافتح http://localhost:8000
