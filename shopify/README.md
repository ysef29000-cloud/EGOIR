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

## 3. شحن مجاني لما العميل ياخد الهودي والبنطلون مع بعض
الثيم بيعرض العرض بس، واللي بيطبّق الشحن المجاني فعلاً هو شوبيفاي. عشان كده لازم تعمل الخصم ده:

Discounts ← Create discount ← **Free shipping**
- Method: **Automatic**، الاسم: `FREE SHIPPING — THE SET`
- Countries: **Egypt**
- Minimum purchase requirements: **Minimum purchase amount = 2200**، وده سعر الهودي (1200) + البنطلون (1000).

**ملحوظة مهمة:** شوبيفاي ما بيسمحش إن الشحن المجاني يتشرط بمنتجات معينة، بيتشرط بمبلغ أو بعدد قطع بس. عشان كده أي أوردر يوصل 2200، زي هوديين مثلاً، هياخد شحن مجاني هو كمان. لو عاوز الشحن المجاني يبقى للهودي + البنطلون بس، محتاج تطبيق خصومات من الـ App Store.

**لو غيّرت الأسعار** غيّر المبلغ ده كمان، وخليه = سعر الهودي + سعر البنطلون.

## 4. الدفع والشحن
- **كاش عند الاستلام:** Settings ← Payments ← Manual payment methods ← **Cash on Delivery (COD)**
- **الشحن 100 ج.م:** Settings ← Shipping and delivery ← General ← Egypt ← Add rate ← **100 EGP**

## 5. Customize
- **Header:** اللوجو والقائمة.
- **Hero image:** صورة الموديل.
- **The set:** صورة لابس الطقم.
- **Theme settings ← Sales:** رقم الواتساب.
- **Footer:** لينك الإنستجرام والتيك توك (الأيقونات بتظهر تحت خالص).
- **Instagram gallery:** ضيف لحد 6 صور من الإنستا + اللينك.

## 6. أكواد المنتجات والتفاصيل التقنية
من صفحة المنتج ← Tags:
- `code:EG-H01` ← الكود اللي بيظهر جنب اسم المنتج.
- `spec:480 GSM cotton` ← كل tag بيبدأ بـ `spec:` بيظهر سطر في جدول تفاصيل المنتج. اكتب التفاصيل الحقيقية بتاعة الخامة والقَصّة.

## 7. الصفحة الرئيسية
- **Set stage:** أول شاشة. بتاخد الهودي والبنطلون من Theme settings ← The set.
- **Product index:** قائمة المنتجات الكبيرة.
- **Lookbook:** 3 صور، ولكل صورة كابشن.
