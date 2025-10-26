// const features = [
//   {
//     icon: "fa-solid fa-door-closed",
//     title: "Premium Quality",
//     description:
//       "Built with precision and lasting materials for long-term elegance and performance.",
//   },
//   {
//     icon: "fa-solid fa-brush",
//     title: "Modern Design",
//     description:
//       "A variety of contemporary styles to complement every interior or exterior look.",
//   },
//   {
//     icon: "fa-solid fa-shield-halved",
//     title: "Trusted Durability",
//     description:
//       "Engineered to resist wear, weather, and time — keeping your space secure and stylish.",
//   },
//   {
//     icon: "fa-solid fa-truck",
//     title: "Free Shipping",
//     description: "Free shipping on orders over $100.",
//   },
// ];

exports.renderHome = (req, res) => {
  const lang = req.lang;

  res.render("index", {
    layout: "layout/main",
    title: res?.locals?.settings?.meta?.title[lang] || "Home page",
    description:
      res?.locals?.settings?.meta?.description[lang] || "Doors e-commerce",
    keywords: res?.locals?.settings?.meta?.keywords[lang] || "",
    author: res?.locals?.settings?.meta?.author[lang] || "",
    siteName: res?.locals?.settings?.siteName[lang] || "",
    lang,
    // features,
  });
};
