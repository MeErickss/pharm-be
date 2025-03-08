import db from "../config/db.js";

export const getController = (req, res) => {
  const queriesPermitidas = {
    "parametros_producao": `
      SELECT p.*, m.NOME AS MEDIDA, u.UNIDADE AS UNIDADE, f.NOME AS FUNCAO 
      FROM parametros p 
      LEFT JOIN parametros_medidas pm ON p.ID = pm.ID_PARAMETROS 
      LEFT JOIN medidas m ON pm.ID_MEDIDAS = m.ID 
      LEFT JOIN parametros_unidades pu ON p.ID = pu.ID_PARAMETROS 
      LEFT JOIN unidades u ON pu.ID_UNIDADES = u.ID 
      LEFT JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS 
      LEFT JOIN funcoes f ON pf.ID_FUNCOES = f.ID;
    `,
    "parametros_armazenamento": "SELECT * FROM parametros WHERE FUNCAO='ARMAZENAMENTO'",
    "tipos_parametros": "SELECT * FROM tipos_parametros",
    "users": "SELECT * FROM users",
    "unidades": "SELECT * FROM unidades",
    "funcoes": "SELECT * FROM funcoes",
    "status": "SELECT * FROM status"
  };

  const { table } = req.query;

  if (!table) {
    return res.status(400).json({ error: "O parâmetro 'table' é obrigatório." });
  }

  const sql = queriesPermitidas[table];
  if (!sql) {
    return res.status(400).json({ error: `A tabela '${table}' não é válida.` });
  }

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao buscar dados:", err);
      return res.status(500).json({ error: "Erro ao buscar dados no banco de dados." });
    }

    res.json(results);
  });
};
