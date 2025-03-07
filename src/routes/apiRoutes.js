import express from "express";
import "../controllers/parametrosController.js";

const router = express.Router();

router.get("/table", getParametros);
router.post("/insert", getParametros);
router.delete("/delete", getParametros);
router.put("/update", getParametros);
router.get("/select", addParametro);

export default router;
