# EGOIR على شوبيفاي — خطوات التشغيل

## 1. ارفع الثيم
Online Store ← Themes ← Add theme ← Upload zip file ← اختار `EGOIR-shopify-theme.zip` (من غير ما تفكه).
بعدين **Preview** ولما يعجبك **Publish**.

## 2. ضيف المنتجات
Products ← Import ← اختار `shopify/products.csv`.
- هيعمل **EGOIR Hoodie** (Black / White / Iron) و **EGOIR Pants** (Black / Beige)، مقاسات S–XL.
- الأسعار مؤقتة: الهودي 1200، البنطلون 1000. والمخزون 10 لكل مقاس. عدّلهم من صفحة كل منتج.
- ارفع الصور، وبعدين من كل variant اختار صورة اللون بتاعه. ده اللي بيخلّي الصورة تتغير لما العميل يختار اللون.
- **متغيرش الـ handle** (`egoir-hoodie` و `egoir-pants`). لو غيّرته، اختار المنتجين من Customize ← Theme settings ← The set.

## 3. خصم الطقم 20% (لازم يتعمل عشان الخصم يتطبق فعلاً)
الثيم بيعرض الخصم بس، لكن اللي بيطبّقه هو شوبيفاي. عشان كده لازم تعمله:

Discounts ← Create discount ← **Buy X get Y**
- Method: **Automatic**، الاسم: `THE SET`
- Customer buys: Minimum quantity of items = **1** ← Specific products ← **EGOIR Pants**
- Customer gets: Quantity = **1** ← Specific products ← **EGOIR Hoodie**
- At a discounted value: **Amount off each** = **440**
- Maximum number of uses per order: **سيبها فاضية**، عشان كل هودي + بنطلون في نفس الأوردر ياخدوا الخصم.

**الـ 440 دي محسوبة كده:** 20% من (1200 + 1000) = 440.
**لو غيّرت الأسعار لازم تغيّر الرقم ده:** الرقم الجديد = (سعر الهودي + سعر البنطلون) × 0.2.

الخصم بيظهر في السلة على سطر الهودي، لكنه في الحقيقة 20% من سعر القطعتين مع بعض.

## 4. الدفع والشحن
- **كاش عند الاستلام:** Settings ← Payments ← Manual payment methods ← **Cash on Delivery (COD)**
- **الشحن 100 ج.م:** Settings ← Shipping and delivery ← General ← Egypt ← Add rate ← **100 EGP**

## 5. Customize
- **Header:** اللوجو والقائمة.
- **Hero image:** صورة الموديل.
- **The set:** صورة لابس الطقم.
- **Theme settings ← Sales:** رقم الواتساب.
