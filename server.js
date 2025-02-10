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

app.get("/api/parametros_producao", (req, res) => {
  console.log("Endpoint /api/parametros_producao chamado");

  const sql = "SELECT * FROM parameters_producao";
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

app.put("/api/edit", (req, res) => {
  const { id, ...updates } = req.body; // Extrai o id e os outros campos dinamicamente

  if (!id) {
    return res.status(400).json({ error: "O ID é obrigatório" });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nenhum campo para atualizar" });
  }

  // Monta dinamicamente os campos e placeholders para a query SQL
  const fields = Object.keys(updates).map(field => `${field} = ?`).join(", ");
  const values = Object.values(updates);

  const sql = `UPDATE unidades SET ${fields} WHERE id = ?`;

  db.query(sql, [...values, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar unidade:", err);
      return res.status(500).json({ error: "Erro ao atualizar unidade" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nenhuma unidade encontrada com esse ID" });
    }

    res.json({ message: "Unidade atualizada com sucesso" });
  });
});


app.delete("/api/delete/:tableName/:id", (req, res) => {
  const { tableName, id } = req.params; // Pegando ID e tableName da URL

  // Verifica se os dados necessários foram passados
  if (!id || !tableName) {
    return res.status(400).json({ error: "O ID e o nome da tabela são obrigatórios" });
  }

  // Proteção contra SQL Injection
  const allowedTables = ["unidades", "outra_tabela", "mais_tabelas"]; // Defina as tabelas permitidas
  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: "Tabela não permitida" });
  }

  // Query SQL para deletar o item da tabela especificada
  const sql = `DELETE FROM ${tableName} WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Erro ao deletar registro:", err);
      return res.status(500).json({ error: "Erro ao deletar registro" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nenhum registro encontrado com esse ID" });
    }

    res.json({ message: `Registro deletado com sucesso da tabela ${tableName}` });
  });
});
