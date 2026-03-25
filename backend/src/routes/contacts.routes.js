import { Router } from "express";
import {
  getAllContactsController,
  searchContactsController
} from "../controllers/contacts.controller.js";

const router = Router();

router.get("/", getAllContactsController);
router.get("/search", searchContactsController);

export default router;