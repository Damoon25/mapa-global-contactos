const express = require("express");
const cors = require("cors");
const contactsRoutes = require("./routes/contacts.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend funcionando"
  });
});

app.use("/api/contacts", contactsRoutes);

module.exports = app;