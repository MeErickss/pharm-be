import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql",
  database: "pharmbd",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    throw err;
  }
  console.log("Conectado ao banco de dados!");

  const tabelas = [
    `CREATE TABLE IF NOT EXISTS status (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      DESCRICAO VARCHAR(255) NOT NULL UNIQUE
    );`,
    `CREATE TABLE IF NOT EXISTS log_alarmes (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    );`,
    `CREATE TABLE IF NOT EXISTS log_producao (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    );`,
    `CREATE TABLE IF NOT EXISTS medidas (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      NOME VARCHAR(90) NOT NULL UNIQUE,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    );`,
    `CREATE TABLE IF NOT EXISTS funcoes (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      NOME VARCHAR(255) NOT NULL UNIQUE,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    );`,
    `CREATE TABLE IF NOT EXISTS unidades (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      NOME VARCHAR(255) NOT NULL UNIQUE,
      TIPO VARCHAR(90) NOT NULL,
      ABREVIACAO VARCHAR(10) NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO),
      FOREIGN KEY (TIPO) REFERENCES medidas(NOME)
    );`,
    `CREATE TABLE IF NOT EXISTS medidas_unidades (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      ID_UNIDADE INT NOT NULL,
      ID_TIPO INT NOT NULL,
      FOREIGN KEY (ID_TIPO) REFERENCES medidas(ID),
      FOREIGN KEY (ID_UNIDADE) REFERENCES unidades(ID)
    );`,
    `CREATE TABLE IF NOT EXISTS parametros (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      FUNCAO VARCHAR(255) NOT NULL,
      PARAMETRO VARCHAR(255) NOT NULL,
      MEDIDA VARCHAR(255) NOT NULL,
      UNIDADE VARCHAR(255) NOT NULL,
      VALOR INT NOT NULL,
      VL_MIN INT NOT NULL,
      VL_MAX INT NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO),
      FOREIGN KEY (FUNCAO) REFERENCES funcoes(NOME),
      FOREIGN KEY (MEDIDA) REFERENCES medidas(NOME),
      FOREIGN KEY (UNIDADE) REFERENCES unidades(NOME)
    );`,
    `CREATE TABLE IF NOT EXISTS parametros_unidades (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      ID_PARAMETROS INT NOT NULL,
      ID_UNIDADES INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID),
      FOREIGN KEY (ID_UNIDADES) REFERENCES unidades(ID)
    );`,
    `CREATE TABLE IF NOT EXISTS parametros_medidas (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      ID_PARAMETROS INT NOT NULL,
      ID_MEDIDAS INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID),
      FOREIGN KEY (ID_MEDIDAS) REFERENCES medidas(ID)
    );`,
    `CREATE TABLE IF NOT EXISTS parametros_funcoes (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      ID_PARAMETROS INT NOT NULL,
      ID_FUNCOES INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID),
      FOREIGN KEY (ID_FUNCOES) REFERENCES funcoes(ID)
    );`,
    `CREATE TABLE IF NOT EXISTS users (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      LOGIN VARCHAR(255) NOT NULL,
      PASSWORD VARCHAR(255) NOT NULL,
      NIVEL INT NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    );`
  ];

  tabelas.forEach((query) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error("Erro ao criar tabela:", err);
      }
    });
  });

  const inserts = [
    `INSERT IGNORE INTO status VALUES (1,'ATIVO'), (2,'INATIVO'), (3,'BLOQUEADO'), (4,'RETIDO');`,
    `INSERT IGNORE INTO funcoes VALUES (1,'PRODUCAO','ATIVO'), (2,'ARMAZENAMENTO','ATIVO');`,
    `INSERT IGNORE INTO users VALUES (1,'admin@gmail.com','0000',3,'ATIVO'), (2,'maintenance@gmail.com','1111',2,'ATIVO'), (3,'operator@gmail.com','2222',1,'ATIVO');`,
    `INSERT IGNORE INTO medidas VALUES (1,'TEMPO','ATIVO'), (2,'PRESSAO','ATIVO');`,
    `INSERT IGNORE INTO unidades VALUES(1,'SEGUNDO', 'TEMPO','SEG','ATIVO'), (3,'PSI', 'PRESSAO','PSI','ATIVO'), (2,'HORA', 'TEMPO','HR','ATIVO');`,
    `INSERT IGNORE INTO parametros VALUES (1,'PRODUCAO','TEMPO PARA DRENAGEM DO TANQUE DE MISTURA [TQ-100]','TEMPO','SEGUNDO',20,10,30,'ATIVO'), (2,'PRODUCAO','TEMPO PARA DRENAGEM DO TANQUE DE ADIÇÃO [TQ-200]','TEMPO','SEGUNDO',30,15,45,'ATIVO');`
  ];

  inserts.forEach((query) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error("Erro ao inserir dados:", err);
      }
    });
  });

  console.log("Tabelas criadas e dados inseridos.");

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});


// Endpoint para pegar dados

app.get("/api/table", (req, res) => {
  const verify = {
    "parametros_producao": "SELECT * FROM parametros WHERE FUNCAO='PRODUCAO'",
    "parametros_armazenamento": "SELECT * FROM parametros WHERE FUNCAO='ARMAZENAMENTO'",
    "tipos_parametros": "SELECT * FROM tipos_parametros",
    "users": "SELECT * FROM users",
    "unidades": "SELECT * FROM unidades",
    "funcoes": "SELECT * FROM funcoes",
    "status": "SELECT * FROM status"
  };

  const { table } = req.query; // Obtém os parâmetros da URL

  if (!table) {
    return res.status(400).send("Parâmetros insuficientes");
  }

  const sql = verify[table];
  if (!sql) {
    return res.status(400).send("Tabela inválida");
  }

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao pegar dados:", err);
      return res.status(500).send("Erro ao pegar dados");
    }

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

app.get("/api/select", (req, res) => {
  const verify = {
    "UNID": "SELECT * FROM unidades",
    "STATUS": "SELECT * FROM status",
    "TIPO": "SELECT * FROM tipos_parametros",
    "FUNCAO": "SELECT * FROM funcoes"
  };

  const { table } = req.query; // Obtém os parâmetros da URL

  if (!table) {
    return res.status(400).send("Parâmetros insuficientes");
  }

  const sql = verify[table];
  if (!sql) {
    return res.status(400).send("Tabela inválida");
  }

  console.log(`Executando SQL: ${sql}`); // Debugging

  db.query(sql, (err, results) => {
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

app.post("/api/insert", (req, res) => {
  const { table, values } = req.body;

  if (!table || !values) {
    return res.status(400).json({ error: "Parâmetros insuficientes. Necessário: table, values" });
  }

  // Criando a query dinâmica de INSERT
  const fields = Object.keys(values).join(", ");
  const placeholders = Object.keys(values).map(() => "?").join(", ");
  const valuesArray = Object.values(values);

  const sql = `INSERT INTO ${table} (${fields}) VALUES (${placeholders})`;

  console.log("Executando SQL:", sql, valuesArray); // Para debug

  db.query(sql, valuesArray, (err, results) => {
    if (err) {
      console.error("Erro ao inserir dados:", err);
      return res.status(500).json({ error: "Erro ao inserir dados" });
    }

    res.json({ message: "Registro inserido com sucesso!" });
  });
});

