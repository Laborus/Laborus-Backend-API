const router = require("express").Router();

// API check

router.get("/", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = router;
