import express from "express";
import { getController } from "./controllers/getController.js";

const app = express();
const port = 3000;

app.get("/api/get", getController);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
