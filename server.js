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
app.get("/api/users", (req, res) => {
  console.log("Endpoint /api/users chamado");

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

app.get("/api/parametros", (req, res) => {
  console.log("Endpoint /api/parametros chamado");

  const sql = "SELECT * FROM parametros";
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

app.get("/api/tipos_parametros", (req, res) => {
  console.log("Endpoint /api/tipos_parametros chamado");

  const sql = "SELECT * FROM tipos_parametros";
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

app.get("/api/unidades", (req, res) => {
  console.log("Endpoint /api/unidades chamado");

  const sql = "SELECT * FROM unidades";
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

app.get("/api/status", (req, res) => {
  console.log("Endpoint /api/status chamado");

  const sql = "SELECT * FROM status";
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

app.get("/api/functions", (req, res) => {
  console.log("Endpoint /api/functions chamado");

  const sql = "SELECT * FROM funcoes";
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

app.get("/api/query", (req, res) => {
  const { table, column, value } = req.query; // Obtém os parâmetros da URL

  if (!table || !column || !value) {
    return res.status(400).send("Parâmetros insuficientes");
  }

  const sql = `SELECT * FROM ?? WHERE ?? = ?`; // Query com placeholders seguros
  db.query(sql, [table, column, value], (err, results) => {
    if (err) {
      console.error("Erro ao pegar dados:", err);
      return res.status(500).send("Erro ao pegar dados");
    }

    res.json(results);
  });
});

