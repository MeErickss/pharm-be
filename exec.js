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
    `CREATE TABLE IF NOT EXISTS grandeza(
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
    `CREATE TABLE IF NOT EXISTS grandeza_unidades(
      ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      ID_UNIDADE INT NOT NULL,
      ID_GRANDEZA INT NOT NULL,
      FOREIGN KEY (ID_GRANDEZA) REFERENCES grandeza(ID) ON DELETE CASCADE,
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
    `CREATE TABLE IF NOT EXISTS parametros_grandeza(
      ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      ID_PARAMETROS INT NOT NULL,
      ID_grandeza INT NOT NULL,
      FOREIGN KEY (ID_PARAMETROS) REFERENCES parametros(ID) ON DELETE CASCADE,
      FOREIGN KEY (ID_grandeza) REFERENCES grandeza(ID) ON DELETE CASCADE
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
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE,
      FOREIGN KEY (NIVEL) REFERENCES niveis(ID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS niveis(
      ID INT AUTO_INCREMENT PRIMARY KEY,
      DESCRICAO VARCHAR(255) NOT NULL UNIQUE,
      STATUS VARCHAR(90) NOT NULL,
      FOREIGN KEY (STATUS) REFERENCES status(DESCRICAO) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE log_alarmes(
      ID INT NOT NULL PRIMARY KEY,
        USERS VARCHAR(90) NOT NULL,
        DESCRICAO VARCHAR(90) NOT NULL,
        DATAHORA TIMESTAMP NOT NULL,
        STATUS VARCHAR(90) NOT NULL
    );`,
    
    `CREATE TABLE log_producao(
      ID INT NOT NULL PRIMARY KEY,
        USERS VARCHAR(90) NOT NULL,
        DESCRICAO VARCHAR(90) NOT NULL,
        DATAHORA TIMESTAMP NOT NULL,
        STATUS VARCHAR(90) NOT NULL
    );`,
    
    `CREATE TABLE log_armazenamento(
      ID INT NOT NULL PRIMARY KEY,
        USERS VARCHAR(90) NOT NULL,
        DESCRICAO VARCHAR(90) NOT NULL,
        DATAHORA TIMESTAMP NOT NULL,
        STATUS VARCHAR(90) NOT NULL
    );`
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

    `INSERT IGNORE INTO grandeza VALUES (1, 'TEMPO', 'ATIVO');`,
    `INSERT IGNORE INTO grandeza VALUES (2, 'PRESSAO', 'ATIVO');`,

    `INSERT IGNORE INTO unidades VALUES (1, 'SEGUNDO', 'SEG', 'ATIVO');`,
    `INSERT IGNORE INTO unidades VALUES (2, 'HORA', 'HR', 'ATIVO');`,
    `INSERT IGNORE INTO unidades VALUES (3, 'PSI', 'PSI', 'ATIVO');`,

    `INSERT IGNORE INTO parametros (ID, PARAMETRO, VALOR, VL_MIN, VL_MAX, STATUS)
    VALUES (1, 'TEMPO PARA DRENAGEM DO TANQUE DE MISTURA [TQ-100]', 20, 10, 30, 'ATIVO');`,
    `INSERT IGNORE INTO parametros (ID, PARAMETRO, VALOR, VL_MIN, VL_MAX, STATUS)
    VALUES (2, 'TEMPO PARA DRENAGEM DO TANQUE DE ADIÇÃO [TQ-200]', 30, 15, 45, 'ATIVO');`,

    `INSERT IGNORE INTO parametros (ID, PARAMETRO, VALOR, VL_MIN, VL_MAX, STATUS)
    VALUES (3, 'TEMPO PARA DRENAGEM DO TANQUE TQ-300', 40, 5, 200, 'ATIVO');`,
    `INSERT IGNORE INTO parametros (ID, PARAMETRO, VALOR, VL_MIN, VL_MAX, STATUS)
    VALUES (4, 'TEMPO PARA DRENAGEM DO TANQUE TQ-310', 10, 5, 100, 'ATIVO');`,

    `INSERT IGNORE INTO grandeza_unidades VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO grandeza_unidades VALUES (2, 2, 1);`,
    `INSERT IGNORE INTO grandeza_unidades VALUES (3, 3, 2);`,

    `INSERT IGNORE INTO parametros_unidades VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_unidades VALUES (2, 2, 2);`,
    `INSERT IGNORE INTO parametros_unidades VALUES (3, 3, 1);`,
    `INSERT IGNORE INTO parametros_unidades VALUES (4, 4, 2);`,

    `INSERT IGNORE INTO parametros_grandeza VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_grandeza VALUES (2, 2, 1);`,
    `INSERT IGNORE INTO parametros_grandeza VALUES (3, 3, 1);`,
    `INSERT IGNORE INTO parametros_grandeza VALUES (4, 4, 1);`,

    `INSERT IGNORE INTO parametros_funcoes VALUES (1, 1, 1);`,
    `INSERT IGNORE INTO parametros_funcoes VALUES (2, 2, 1);`,
    `INSERT IGNORE INTO parametros_funcoes VALUES (3, 3, 2);`,
    `INSERT IGNORE INTO parametros_funcoes VALUES (4, 4, 2);`,

    `INSERT IGNORE INTO niveis VALUES (1,'ADMIN', 'ATIVO');`,
    `INSERT IGNORE INTO niveis VALUES (2,'MANUTENCAO', 'ATIVO');`,
    `INSERT IGNORE INTO niveis VALUES (3,'OPERADOR', 'ATIVO');`
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
    "parametros_producao": "SELECT p.*, m.NOME AS GRANDEZA, u.UNIDADE AS UNIDADE, f.NOME AS FUNCAO FROM parametros p LEFT JOIN parametros_grandeza pm ON p.ID = pm.ID_PARAMETROS LEFT JOIN grandeza m ON pm.ID_grandeza = m.ID LEFT JOIN parametros_unidades pu ON p.ID = pu.ID_PARAMETROS LEFT JOIN  unidades u ON pu.ID_UNIDADES = u.ID LEFT JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS LEFT JOIN funcoes f ON pf.ID_FUNCOES = f.ID WHERE f.NOME = 'PRODUCAO';",
    "parametros_armazenamento": "SELECT p.*, m.NOME AS GRANDEZA, u.UNIDADE AS UNIDADE, f.NOME AS FUNCAO FROM parametros p LEFT JOIN parametros_grandeza pm ON p.ID = pm.ID_PARAMETROS LEFT JOIN grandeza m ON pm.ID_grandeza = m.ID LEFT JOIN parametros_unidades pu ON p.ID = pu.ID_PARAMETROS LEFT JOIN  unidades u ON pu.ID_UNIDADES = u.ID LEFT JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS LEFT JOIN funcoes f ON pf.ID_FUNCOES = f.ID WHERE f.NOME = 'ARMAZENAMENTO';",
    "grandeza": "SELECT * FROM grandeza",
    "users": "SELECT * FROM users",
    "unidades": "SELECT * FROM unidades",
    "funcoes": "SELECT * FROM funcoes",
    "niveis": "SELECT * FROM niveis",
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
    "STATUS": "SELECT DESCRICAO FROM status",
    "GRANDEZA":"SELECT NOME FROM grandeza",
    "FUNCAO" : "SELECT NOME FROM funcoes",
    "NIVEL" : "SELECT DESCRICAO FROM niveis",
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

app.get("/api/selectunidade", (req, res) => {
  const { value } = req.query; // Obtém os parâmetros da URL

  if (!value) {
    return res.status(400).send("Parâmetros insuficientes");
  }

  const sql = `
    SELECT u.UNIDADE 
    FROM unidades u 
    LEFT JOIN grandeza_unidades MU ON MU.ID_UNIDADE = u.ID 
    LEFT JOIN grandeza g ON g.ID = MU.ID_GRANDEZA 
    WHERE g.NOME = ?;
  `;

  console.log(`Executando SQL: ${sql} com valor: ${value}`); // Debugging

  db.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Erro ao pegar dados:", err);
      return res.status(500).send("Erro ao pegar dados");
    }

    res.json(results);
  });
});


// Função para ajustar o AUTO_INCREMENT
function ajustarAutoIncrement(tabela, callback) {
  if (tabela == "parametros_producao" || tabela == "parametros_armazenamento"){
    tabela = "parametros"
  }
  const verify = {
    "parametros": "SELECT MAX(ID) AS max_id FROM parametros;",
    "grandeza": "SELECT MAX(ID) AS max_id FROM grandeza;",
    "users": "SELECT MAX(ID) AS max_id FROM users;",
    "unidades": "SELECT MAX(ID) AS max_id FROM unidades;",
    "funcoes": "SELECT MAX(ID) AS max_id FROM funcoes;",
    "niveis": "SELECT MAX(ID) AS max_id FROM niveis;",
    "status": "SELECT MAX(ID) AS max_id FROM status;"
  };

  if (!verify[tabela]) {
    console.error("Tabela inválida:", tabela);
    return callback(new Error("Tabela inválida"));
  }

  const querySQL = verify[tabela];

  db.query(querySQL, (err, rows) => {
    if (err) {
      console.error(`Erro ao obter o maior ID da tabela ${tabela}:`, err);
      return callback(err);
    }

    const maxId = rows[0]?.max_id || 0; // Se não houver registros, assume 0
    const nextAutoIncrement = maxId + 1;

    const setAutoIncrementSQL = `ALTER TABLE ${tabela} AUTO_INCREMENT = ?`;
    db.query(setAutoIncrementSQL, [nextAutoIncrement], (err) => {
      if (err) {
        console.error(`Erro ao ajustar o AUTO_INCREMENT da tabela ${tabela}:`, err);
        return callback(err);
      }

      console.log(`AUTO_INCREMENT ajustado com sucesso para a tabela ${tabela}`);
      callback(null);
    });
  });
}


app.delete("/api/delete", (req, res) => {
  const verify = {
    "parametros_producao": "DELETE p FROM parametros p JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS JOIN funcoes f ON pf.ID_FUNCOES = f.ID WHERE f.NOME = 'PRODUCAO' AND p.ID = ?;",
    "parametros_armazenamento": "DELETE p FROM parametros p JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS JOIN funcoes f ON pf.ID_FUNCOES = f.ID WHERE f.NOME = 'ARMAZENAMENTO' AND p.ID = ?;",
    "grandeza": "DELETE FROM grandeza WHERE ID = ?",
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
    ajustarAutoIncrement(table,(err) => {
      if (err) {
        return res.status(500).send("Erro ao ajustar o AUTO_INCREMENT");
      }

      res.send("Registro deletado com sucesso e AUTO_INCREMENT ajustado");
    });
  });
});



app.post("/api/insert", (req, res) => {
  const verify = {
    "parametros": "INSERT INTO parametros (PARAMETRO, VALOR, VL_MAX, VL_MIN, STATUS) VALUES (?, ?, ?, ?, ?)",
    "grandeza": "INSERT INTO grandeza (NOME, STATUS) VALUES (?, ?)",
    "users": "INSERT INTO users (LOGIN, PASSWORD, NIVEL, STATUS) VALUES (?, ?, ?, ?)",
    "unidades": "INSERT INTO unidades (UNIDADE, ABREVIACAO, STATUS) VALUES (?, ?, ?)",
    "funcoes": "INSERT INTO funcoes (NOME, STATUS) VALUES (?, ?)",
    "status": "INSERT INTO status (DESCRICAO) VALUES (?)"
  };

  const { table, ...values } = req.body;

  if (!verify[table]) {
    return res.status(400).json({ error: "Tabela inválida ou não suportada" });
  }

  db.query(verify[table], Object.values(values), (err, results) => {
    if (err) {
      console.error(`Erro ao inserir em ${table}:`, err);
      return res.status(500).json({ error: `Erro ao inserir em ${table}` });
    }

    // Se a tabela for "parametros", criar as associações
    if (table === "parametros") {
      const idParametro = results.insertId;
      const { GRANDEZA, UNIDADE, FUNCAO } = values;

      const insertQueries = [
        {
          sql: `INSERT INTO parametros_grandeza (ID_PARAMETROS, ID_grandeza) VALUES (?, (SELECT ID FROM grandeza WHERE NOME = ?))`,
          values: [idParametro, GRANDEZA]
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

      let queriesExecutadas = 0;
      insertQueries.forEach(({ sql, values }) => {
        db.query(sql, values, (err) => {
          if (err) {
            console.error("Erro ao associar:", err);
          }
          queriesExecutadas++;
          if (queriesExecutadas === insertQueries.length) {
            res.json({ message: "Parâmetro inserido e relações criadas com sucesso!" });
          }
        });
      });
    } else {
      res.json({ message: `Registro inserido com sucesso na tabela ${table}!` });
    }
  });
});


app.put("/api/update", (req, res) => {
  const verify = {
    parametros: [
      `UPDATE parametros 
       SET PARAMETRO=?, VALOR=?, VL_MIN=?, VL_MAX=?, STATUS=? 
       WHERE ID = ?;`,
      `UPDATE parametros_grandeza pm 
       JOIN grandeza m ON m.NOME = ? 
       SET pm.ID_grandeza = m.ID 
       WHERE pm.ID_PARAMETROS = ?;`,
      `UPDATE parametros_unidades pu 
       JOIN unidades u ON u.UNIDADE = ? 
       SET pu.ID_UNIDADES = u.ID 
       WHERE pu.ID_PARAMETROS = ?;`,
      `UPDATE parametros_funcoes pf 
       JOIN funcoes f ON f.NOME = ? 
       SET pf.ID_FUNCOES = f.ID 
       WHERE pf.ID_PARAMETROS = ?;`
    ],
  };

  const { table, values, id } = req.body; // Pegando os dados do corpo da requisição

  if (!table || !values || !id) {
    return res.status(400).send("Parâmetros insuficientes");
  }

  const sqlQueries = verify[table];
  if (!sqlQueries) {
    return res.status(400).send("Tabela inválida");
  }

  const queryParams = [
    [values.PARAMETRO, values.VALOR, values.VL_MIN, values.VL_MAX, values.STATUS, id],
    [values.GRANDEZA, id],
    [values.UNIDADE, id],
    [values.FUNCAO, id]
  ];

  let errorOccurred = false;

  sqlQueries.forEach((query, index) => {
    if (errorOccurred) return; // Se um erro já ocorreu, interrompe a execução

    db.query(query, queryParams[index], (err) => {
      if (err) {
        console.error(`Erro ao executar query ${index + 1}:`, err);
        errorOccurred = true;
        return res.status(500).send(`Erro ao atualizar ${table}`);
      }

      // Se for a última query e não houver erros, envia a resposta de sucesso
      if (index === sqlQueries.length - 1) {
        res.send("Registro atualizado com sucesso!");
      }
    });
  });
});
