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
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw err;
  }
  console.log('Conectado ao banco de dados');

  const tabelas = [
    `CREATE TABLE IF NOT EXISTS status(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      DESCRICAO VARCHAR(255) NOT NULL UNIQUE
    )`,

    `CREATE TABLE IF NOT EXISTS log_alarmes(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    )`,

    `CREATE TABLE IF NOT EXISTS log_producao(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    )`,

    `CREATE TABLE IF NOT EXISTS medidas(
      ID INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
      NOME VARCHAR(90) NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    )`,

    `CREATE TABLE IF NOT EXISTS funcoes(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      NOME VARCHAR(255) NOT NULL UNIQUE,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    )`,

    `CREATE TABLE IF NOT EXISTS unidades(
      ID INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
      UNIDADE VARCHAR(255) NOT NULL UNIQUE,
      ABREVIACAO VARCHAR(10) NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    )`,

    `CREATE TABLE IF NOT EXISTS medidas_unidades(
      ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      ID_UNIDADE INT NOT NULL,
      ID_TIPO INT NOT NULL,
      FOREIGN KEY (ID_TIPO) REFERENCES medidas(ID),
      FOREIGN KEY (ID_UNIDADE) REFERENCES unidades(ID)
    )`,

    `CREATE TABLE IF NOT EXISTS parametros(
      ID INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT NOT NULL,
      PARAMETRO VARCHAR(255) NOT NULL,
      VALOR INTEGER NOT NULL,
      VL_MIN INTEGER NOT NULL,
      VL_MAX INTEGER NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    )`,

    `CREATE TABLE IF NOT EXISTS parametros_unidades(
      ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      ID_PARAMETROS INT NOT NULL,
      ID_UNIDADES INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID),
      FOREIGN KEY (ID_UNIDADES) REFERENCES unidades(ID)
    )`,

    `CREATE TABLE IF NOT EXISTS parametros_medidas(
      ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      ID_PARAMETROS INT NOT NULL,
      ID_MEDIDAS INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID),
      FOREIGN KEY (ID_MEDIDAS) REFERENCES medidas(ID)
    )`,

    `CREATE TABLE IF NOT EXISTS parametros_funcoes(
      ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      ID_PARAMETROS INT NOT NULL,
      ID_FUNCOES INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID),
      FOREIGN KEY (ID_FUNCOES) REFERENCES funcoes(ID)
    )`,

    `CREATE TABLE IF NOT EXISTS users(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      LOGIN VARCHAR(255) NOT NULL,
      PASSWORD VARCHAR(255) NOT NULL,
      NIVEL INT NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO)
    )`
  ];

  tabelas.forEach(criarTabela => {
    db.query(criarTabela, (err, result) => {
      if (err) {
        console.error("Erro ao criar tabela:", err);
        throw err;
      }
    });
  });
  console.log("Tabelas criadas.")

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
  });

  const insert = [
    `INSERT IGNORE INTO status VALUES (1, 'ATIVO');`,
    `INSERT IGNORE INTO status VALUES (2, 'INATIVO');`,
    `INSERT IGNORE INTO status VALUES (3, 'BLOQUEADO');`,
    `INSERT IGNORE INTO status VALUES (4, 'RETIDO');`,
    
    `INSERT IGNORE INTO funcoes VALUES (1, 'PRODUCAO', 'ATIVO');`,
    `INSERT IGNORE INTO funcoes VALUES (2, 'ARMAZENAMENTO', 'ATIVO');`,
    
    `INSERT IGNORE INTO users VALUES (1, 'admin@gmail.com', '0000', 3, 'ATIVO');`,
    `INSERT IGNORE INTO users VALUES (2, 'maintenance@gmail.com', '1111', 2, 'ATIVO');`,
    `INSERT IGNORE INTO users VALUES (3, 'operator@gmail.com', '2222', 1, 'ATIVO');`,
    
    `INSERT IGNORE INTO medidas VALUES (1, 'TEMPO', 'ATIVO');`,
    `INSERT IGNORE INTO medidas VALUES (2, 'PRESSAO', 'ATIVO');`,
    
    `INSERT IGNORE INTO unidades VALUES (1, 'SEGUNDO', 'SEG', 'TEMPO', 'ATIVO');`,
    `INSERT IGNORE INTO unidades VALUES (2, 'HORA', 'HR', 'TEMPO', 'ATIVO');`,
    `INSERT IGNORE INTO unidades VALUES (3, 'PSI', 'PSI', 'PRESSAO', 'ATIVO');`,
    
    `INSERT IGNORE INTO parametros (ID, PARAMETRO, VALOR, VL_MIN, VL_MAX, STATUS)
    VALUES (1, 'TEMPO PARA DRENAGEM DO TANQUE DE MISTURA [TQ-100]', 20, 10, 30, 'ATIVO');`,
    `INSERT IGNORE INTO parametros (ID, PARAMETRO, VALOR, VL_MIN, VL_MAX, STATUS)
    VALUES (2, 'TEMPO PARA DRENAGEM DO TANQUE DE ADIÇÃO [TQ-200]', 30, 15, 45, 'ATIVO');`,
    
    `INSERT IGNORE INTO medidas_unidades VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO medidas_unidades VALUES (2, 2, 1);`,
    `INSERT IGNORE INTO medidas_unidades VALUES (3, 3, 2);`,
    
    `INSERT IGNORE INTO parametros_unidades VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_unidades VALUES (2, 2, 1);`,
    
    `INSERT IGNORE INTO parametros_medidas VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_medidas VALUES (2, 2, 1);`,
    
    `INSERT IGNORE INTO parametros_funcoes VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_funcoes VALUES (2, 2, 1);`
  ];
  
  
  insert.forEach(query => {
    db.query(query, (err, result) => {
      if (err) {
        console.error("Erro ao executar query:", query, err);
      } else {
        console.log("Query executada com sucesso:", query);
      }
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