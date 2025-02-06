import express from 'express';
import mysql from 'mysql2';  // Alteração para 'mysql2'
import cors from 'cors';

const app = express();
const port = 5000;

// Habilitando CORS
app.use(cors());

// Para ler dados em formato JSON
app.use(express.json());

// Configuração do banco de dados com 'mysql2'
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql",
  database: "pharmbd",
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    throw err;
  }
  console.log("Conectado ao banco de dados!");

  // Criação da tabela se não existir
  const criarTabela = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      login VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `;

  db.query(criarTabela, (err, result) => {
    if (err) {
      console.error("Erro ao criar tabela:", err);
      throw err;
    }
    console.log("Tabela criada ou já existente.");
  });

  // Agora que a conexão foi estabelecida, iniciamos o servidor
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});

// Endpoint para pegar dados
app.get("/api/dados", (req, res) => {
  console.log("Endpoint /api/dados chamado");

  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao pegar dados:", err);
      res.status(500).send("Erro ao pegar dados");
      return;
    }

    console.log("Resultados da consulta:", results);  // Verifique se está recebendo resultados
    res.json(results);
  });
});
