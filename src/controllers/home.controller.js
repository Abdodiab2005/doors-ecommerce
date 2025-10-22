exports.renderHome = (req, res) => {
  res.render("index", {
    layout: "layout/main",
    title: "Doors Shop",
    description: "Doors Shop",
    keywords: "Doors Shop",
    author: "Doors Shop",
  });
};
