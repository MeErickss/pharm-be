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
  console.log("Endpoint /api/parametros chamado");

  const sql = "SELECT * FROM parametros WHERE funcao='PRODUCAO'";
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
  const verify = {
    "parametros_producao": "SELECT * FROM parametros WHERE FUNCAO = 'PRODUCAO' AND ?? = ?",
    "parametros_armazenamento": "SELECT * FROM parametros WHERE FUNCAO = 'ARMAZENAMENTO' AND ?? = ?",
    "tipos_parametros": "SELECT * FROM tipos_parametros WHERE ?? = ?",
    "users": "SELECT * FROM users WHERE ?? = ?",
    "unidades": "SELECT * FROM unidades WHERE ?? = ?",
    "funcoes": "SELECT * FROM funcoes WHERE ?? = ?",
    "status": "SELECT * FROM status WHERE ?? = ?"
  };

  const { table, column, value } = req.query; // Obtém os parâmetros da URL

  if (!table || !column || !value) {
    return res.status(400).send("Parâmetros insuficientes");
  }

  const sql = verify[table];
  if (!sql) {
    return res.status(400).send("Tabela inválida");
  }

  db.query(sql, [column, value], (err, results) => {
    if (err) {
      console.error("Erro ao pegar dados:", err);
      return res.status(500).send("Erro ao pegar dados");
    }

    res.json(results);
  });
});

app.delete("/api/delete", (req, res) => {
  const verify = {
    "parametros_producao": "DELETE FROM parametros WHERE FUNCAO = 'PRODUCAO' AND ID = ?",
    "parametros_armazenamento": "DELETE FROM parametros WHERE FUNCAO = 'ARMAZENAMENTO' AND ID = ?",
    "tipos_parametros": "DELETE FROM tipos_parametros WHERE ID = ?",
    "users": "DELETE FROM users WHERE ID = ?",
    "unidades": "DELETE FROM unidades WHERE ID = ?",
    "funcoes": "DELETE FROM funcoes WHERE ID = ?",
    "status": "DELETE FROM status WHERE ID = ?",
  };

  const { table, value } = req.query; // Obtém os parâmetros da URL

  if (!table || !value) {
    return res.status(400).send("Parâmetros insuficientes");
  }

  const sql = verify[table];
  if (!sql) {
    return res.status(400).send("Tabela inválida");
  }

  db.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Erro ao deletar dados:", err);
      return res.status(500).send("Erro ao deletar dados");
    }

    if (results.affectedRows === 0) {
      return res.status(404).send("Nenhum registro encontrado para deletar");
    }

    res.send("Registro deletado com sucesso");
  });
});
