import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import apiRoutes from "./routes/apiRoutes.js";
import { createTables } from "./models/createTables.js";
import { insertInitialData } from "./models/insertData.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

// Inicialização do banco de dados
async function initializeDatabase() {
  try {
    await createTables();
    await insertInitialData();
  } catch (err) {
    console.error("Erro ao inicializar o banco de dados:", err);
  }
}

initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});
