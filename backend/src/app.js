import express from "express";
import cors from "cors";
import contactsRoutes from "./routes/contacts.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API funcionando" });
});

app.use("/api/contacts", contactsRoutes);

export default app;