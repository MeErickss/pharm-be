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
});

async function createTables() {
  const tabelas = [
    `CREATE TABLE IF NOT EXISTS status(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      DESCRICAO VARCHAR(255) NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS log_alarmes(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS log_producao(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS medidas(
      ID INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
      NOME VARCHAR(90) NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS funcoes(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      NOME VARCHAR(255) NOT NULL UNIQUE,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS unidades(
      ID INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
      UNIDADE VARCHAR(255) NOT NULL UNIQUE,
      ABREVIACAO VARCHAR(10) NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS medidas_unidades(
      ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      ID_UNIDADE INT NOT NULL,
      ID_MEDIDAS INT NOT NULL,
      FOREIGN KEY (ID_MEDIDAS) REFERENCES medidas(ID) ON DELETE CASCADE,
      FOREIGN KEY (ID_UNIDADE) REFERENCES unidades(ID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS parametros(
      ID INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT NOT NULL,
      PARAMETRO VARCHAR(255) NOT NULL,
      VALOR INTEGER NOT NULL,
      VL_MIN INTEGER NOT NULL,
      VL_MAX INTEGER NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS parametros_unidades(
      ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      ID_PARAMETROS INT NOT NULL,
      ID_UNIDADES INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID) ON DELETE CASCADE,
      FOREIGN KEY (ID_UNIDADES) REFERENCES unidades(ID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS parametros_medidas(
      ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      ID_PARAMETROS INT NOT NULL,
      ID_MEDIDAS INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID) ON DELETE CASCADE,
      FOREIGN KEY (ID_MEDIDAS) REFERENCES medidas(ID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS parametros_funcoes(
      ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      ID_PARAMETROS INT NOT NULL,
      ID_FUNCOES INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID) ON DELETE CASCADE,
      FOREIGN KEY (ID_FUNCOES) REFERENCES funcoes(ID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS users(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      LOGIN VARCHAR(255) NOT NULL,
      PASSWORD VARCHAR(255) NOT NULL,
      NIVEL INT NOT NULL,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE
    )`
  ];

  for (const query of tabelas) {
    try {
      await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    } catch (err) {
      console.error("Erro ao criar tabela:", err);
      throw err;
    }
  }

  console.log("Tabelas criadas.");
}

async function insertInitialData() {
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

    `INSERT IGNORE INTO unidades VALUES (1, 'SEGUNDO', 'SEG', 'ATIVO');`,
    `INSERT IGNORE INTO unidades VALUES (2, 'HORA', 'HR', 'ATIVO');`,
    `INSERT IGNORE INTO unidades VALUES (3, 'PSI', 'PSI', 'ATIVO');`,

    `INSERT IGNORE INTO parametros (ID, PARAMETRO, VALOR, VL_MIN, VL_MAX, STATUS)
    VALUES (1, 'TEMPO PARA DRENAGEM DO TANQUE DE MISTURA [TQ-100]', 20, 10, 30, 'ATIVO');`,
    `INSERT IGNORE INTO parametros (ID, PARAMETRO, VALOR, VL_MIN, VL_MAX, STATUS)
    VALUES (2, 'TEMPO PARA DRENAGEM DO TANQUE DE ADIÇÃO [TQ-200]', 30, 15, 45, 'ATIVO');`,

    `INSERT IGNORE INTO medidas_unidades VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO medidas_unidades VALUES (2, 2, 1);`,
    `INSERT IGNORE INTO medidas_unidades VALUES (3, 3, 2);`,

    `INSERT IGNORE INTO parametros_unidades VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_unidades VALUES (2, 2, 2);`,

    `INSERT IGNORE INTO parametros_medidas VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_medidas VALUES (2, 2, 1);`,

    `INSERT IGNORE INTO parametros_funcoes VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_funcoes VALUES (2, 2, 1);`
  ];

  for (const query of insert) {
    try {
      await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
      console.log("Query executada com sucesso:", query);
    } catch (err) {
      console.error("Erro ao executar query:", query, err);
    }
  }
}

async function initializeDatabase() {
  try {
    await createTables();  // Aguarda a criação das tabelas
    await insertInitialData();  // Executa os inserts após a criação das tabelas
  } catch (err) {
    console.error("Erro na inicialização do banco de dados:", err);
  }
}

initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});

  

// Endpoint para pegar dados

app.get("/api/table", (req, res) => {
  const verify = {
    "parametros_producao": "SELECT p.*, m.NOME AS MEDIDA, u.UNIDADE AS UNIDADE, f.NOME AS FUNCAO FROM parametros p LEFT JOIN parametros_medidas pm ON p.ID = pm.ID_PARAMETROS LEFT JOIN medidas m ON pm.ID_MEDIDAS = m.ID LEFT JOIN parametros_unidades pu ON p.ID = pu.ID_PARAMETROS LEFT JOIN  unidades u ON pu.ID_UNIDADES = u.ID LEFT JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS LEFT JOIN funcoes f ON pf.ID_FUNCOES = f.ID;",
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

app.get("/api/select", (req, res) => {
  const verify = {
    "UNIDADE": "SELECT UNIDADE FROM unidades",
    "STATUS": "SELECT DESCRICAO FROM status",
    "MEDIDA":"SELECT NOME FROM medidas",
    "FUNCAO" : "SELECT NOME FROM funcoes"
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


// Função para ajustar o AUTO_INCREMENT
function ajustarAutoIncrement(callback) {
  const adjustAutoIncrementSQL = `
    SELECT MAX(ID) AS max_id FROM parametros;
  `;

  db.query(adjustAutoIncrementSQL, (err, rows) => {
    if (err) {
      console.error("Erro ao obter o maior ID:", err);
      return callback(err);
    }

    const maxId = rows[0].max_id || 0;  // Se não houver registros, assume 0
    const nextAutoIncrement = maxId + 1;

    // Alterar o AUTO_INCREMENT com o próximo valor
    const setAutoIncrementSQL = `
      ALTER TABLE parametros AUTO_INCREMENT = ?
    `;

    db.query(setAutoIncrementSQL, [nextAutoIncrement], (err) => {
      if (err) {
        console.error("Erro ao ajustar o AUTO_INCREMENT:", err);
        return callback(err);
      }

      console.log("AUTO_INCREMENT ajustado com sucesso");
      callback(null);
    });
  });
}

app.delete("/api/delete", (req, res) => {
  const verify = {
    "parametros_producao": "DELETE p FROM parametros p JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS JOIN funcoes f ON pf.ID_FUNCOES = f.ID WHERE f.NOME = 'PRODUCAO' AND p.ID = ?;",
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

    // Chama a função para ajustar o AUTO_INCREMENT após a deleção
    ajustarAutoIncrement((err) => {
      if (err) {
        return res.status(500).send("Erro ao ajustar o AUTO_INCREMENT");
      }

      res.send("Registro deletado com sucesso e AUTO_INCREMENT ajustado");
    });
  });
});



app.post("/api/insert", (req, res) => {
  const { PARAMETRO, MEDIDA, UNIDADE, FUNCAO, VALOR, VL_MAX, VL_MIN, STATUS } = req.body;

  if (!PARAMETRO || !MEDIDA || !UNIDADE) {
    return res.status(400).json({ error: "Parâmetros insuficientes. Necessário: PARAMETRO, MEDIDA, UNIDADE" });
  }

  // Inserir o novo parâmetro na tabela `parametros`
  const sqlInsertParametro = `
    INSERT INTO parametros (PARAMETRO, VALOR, VL_MAX, VL_MIN, STATUS) VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sqlInsertParametro, [PARAMETRO, VALOR, VL_MAX, VL_MIN, STATUS], (err, results) => {
    if (err) {
      console.error("Erro ao inserir parâmetro:", err);
      return res.status(500).json({ error: "Erro ao inserir parâmetro" });
    }

    const idParametro = results.insertId; // ID do parâmetro inserido

    // Queries de associação em uma lista
    const insertQueries = [
      {
        sql: `INSERT INTO parametros_medidas (ID_PARAMETROS, ID_MEDIDAS) VALUES (?, (SELECT ID FROM medidas WHERE NOME = ?))`,
        values: [idParametro, MEDIDA]
      },
      {
        sql: `INSERT INTO parametros_unidades (ID_PARAMETROS, ID_UNIDADES) VALUES (?, (SELECT ID FROM unidades WHERE UNIDADE = ?))`,
        values: [idParametro, UNIDADE]
      },
      {
        sql: `INSERT INTO parametros_funcoes (ID_PARAMETROS, ID_FUNCOES) VALUES (?, (SELECT ID FROM funcoes WHERE NOME = ?))`,
        values: [idParametro, FUNCAO]
      }
    ];

    // Executar cada query da lista
    insertQueries.forEach(({ sql, values }) => {
      db.query(sql, values, (err) => {
        if (err) {
          console.error("Erro ao associar:", err);
        }
      });
    });

    res.json({ message: "Parâmetro inserido com sucesso e relações criadas!" });
  });
});



app.put("/api/update", (req, res) => {
  const verify = {
    "parametros_producao": "UPDATE p FROM parametros p JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS JOIN funcoes f ON pf.ID_FUNCOES = f.ID WHERE f.NOME = 'PRODUCAO' AND p.ID = ?;",
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