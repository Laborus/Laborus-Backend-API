const router = require("express").Router();

// index API

router.get("/", (req, res) => {
  res.json({ status: "ONLINE" });
});

module.exports = router;
