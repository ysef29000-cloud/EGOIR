/* =========================================================
   EGOIR — إعدادات المتجر
   عدّل هنا بس: اسم البراند، رقم الواتساب، الشحن، والمنتجات.
   ========================================================= */
window.STORE = {
  brand: "EGOIR",
  tagline: "لبس يعبّر عنك.",
  currency: "ج.م",

  // رقم الواتساب اللي هيوصله الطلب (بالصيغة الدولية من غير + أو أصفار في الأول)
  whatsapp: "201000000000",

  // (اختياري) لينك يستقبل الطلبات JSON — مثلاً Google Apps Script أو Formspree أو Make/Zapier.
  // لو سبته فاضي، الطلب هيتبعت على الواتساب.
  orderEndpoint: "",

  shipping: {
    cost: 60,              // سعر الشحن
    freeOver: 1500,        // شحن مجاني فوق المبلغ ده
    days: "2-4 أيام"
  },

  // عرض بعداد تنازلي في الأعلى (ساعات من أول زيارة)
  offer: {
    text: "خصم 15% على أي أوردر فوق 2000 ج.م — الكود",
    code: "EGO15",
    percent: 15,
    minTotal: 2000,
    hours: 24
  },

  // إشعارات "فلان اشترى" وعدد "بيتفرجوا دلوقتي" — عشوائية ومش حقيقية.
  // سيبها false إلا لو هتربطها بداتا حقيقية (الأرقام الوهمية ممكن تضر الثقة وتخالف قوانين حماية المستهلك).
  socialProof: false,

  categories: ["الكل", "تيشيرتات", "هوديز", "بناطيل", "جاكيتات"],

  // المنتجات — حط صورك في فولدر images وغيّر image
  // image فاضية = تصميم بديل لحد ما تضيف صورك
  products: [
    { id: "p1", name: "Oversized Tee — Black", category: "تيشيرتات", price: 549, oldPrice: 749,
      sizes: ["S","M","L","XL"], colors: ["#111111"], stock: 4, badge: "الأكثر مبيعاً", rating: 4.9, reviews: 212, image: "" },
    { id: "p2", name: "Heavy Hoodie — Sand", category: "هوديز", price: 1199, oldPrice: 1499,
      sizes: ["M","L","XL"], colors: ["#cbb89a"], stock: 7, badge: "جديد", rating: 4.8, reviews: 98, image: "" },
    { id: "p3", name: "Cargo Pants — Olive", category: "بناطيل", price: 999, oldPrice: 0,
      sizes: ["30","32","34","36"], colors: ["#5b5e3f"], stock: 12, badge: "", rating: 4.7, reviews: 143, image: "" },
    { id: "p4", name: "Washed Tee — Grey", category: "تيشيرتات", price: 499, oldPrice: 649,
      sizes: ["S","M","L","XL"], colors: ["#8d8d8d"], stock: 3, badge: "كمية محدودة", rating: 4.8, reviews: 176, image: "" },
    { id: "p5", name: "Varsity Jacket — Navy", category: "جاكيتات", price: 1899, oldPrice: 2399,
      sizes: ["M","L","XL"], colors: ["#1d2a4a"], stock: 5, badge: "خصم 20%", rating: 4.9, reviews: 64, image: "" },
    { id: "p6", name: "Zip Hoodie — Black", category: "هوديز", price: 1299, oldPrice: 0,
      sizes: ["S","M","L","XL"], colors: ["#1a1a1a"], stock: 9, badge: "", rating: 4.6, reviews: 81, image: "" },
    { id: "p7", name: "Wide Leg Jeans", category: "بناطيل", price: 1099, oldPrice: 1349,
      sizes: ["30","32","34"], colors: ["#3c5a7a"], stock: 6, badge: "", rating: 4.7, reviews: 57, image: "" },
    { id: "p8", name: "Logo Tee — Off White", category: "تيشيرتات", price: 529, oldPrice: 0,
      sizes: ["S","M","L","XL"], colors: ["#efe9df"], stock: 15, badge: "", rating: 4.8, reviews: 190, image: "" }
  ],

  reviews: [
    { name: "أحمد م.", city: "القاهرة", text: "الخامة تقيلة والمقاس مظبوط جداً، والأوردر وصل في يومين.", stars: 5 },
    { name: "سارة ع.", city: "الإسكندرية", text: "الهودي أحلى من الصور بكتير. طلبت تاني خلاص.", stars: 5 },
    { name: "يوسف ك.", city: "المنصورة", text: "الدفع عند الاستلام ريّحني، والتبديل كان سهل.", stars: 5 }
  ],

  faq: [
    ["الدفع إزاي؟", "كاش عند الاستلام في كل محافظات مصر، أو فودافون كاش / إنستاباي."],
    ["الشحن بياخد قد إيه؟", "من 2 لـ 4 أيام عمل، وشحن مجاني للأوردرات فوق 1500 ج.م."],
    ["لو المقاس مش مظبوط؟", "تبديل أو استرجاع مجاني خلال 14 يوم بدون أي أسئلة."],
    ["أعرف مقاسي إزاي؟", "اضغط على \"دليل المقاسات\" جوه أي منتج، ولو محتار كلمنا واتساب."]
  ],

  social: { instagram: "#", tiktok: "#", facebook: "#" }
};
