import db from "../config/db.js";

function ajustarAutoIncrement(callback) {
  const adjustAutoIncrementSQL = `SELECT MAX(ID) AS max_id FROM parametros;`;

  db.query(adjustAutoIncrementSQL, (err, rows) => {
    if (err) {
      console.error("Erro ao obter o maior ID:", err);
      return callback(err);
    }

    const maxId = rows[0]?.max_id || 0;
    const nextAutoIncrement = maxId + 1;

    const setAutoIncrementSQL = `ALTER TABLE parametros AUTO_INCREMENT = ?`;

    db.query(setAutoIncrementSQL, [nextAutoIncrement], (err) => {
      if (err) {
        console.error("Erro ao ajustar o AUTO_INCREMENT:", err);
        return callback(err);
      }

      console.log("AUTO_INCREMENT ajustado com sucesso.");
      callback(null);
    });
  });
}

export const deleteParametros = (req, res) => {
  const queriesPermitidas = {
    "parametros_producao": `
      DELETE p FROM parametros p 
      JOIN parametros_funcoes pf ON p.ID = pf.ID_PARAMETROS 
      JOIN funcoes f ON pf.ID_FUNCOES = f.ID 
      WHERE f.NOME = 'PRODUCAO' AND p.ID = ?;
    `,
    "parametros_armazenamento": "DELETE FROM parametros WHERE FUNCAO = 'ARMAZENAMENTO' AND ID = ?",
    "tipos_parametros": "DELETE FROM tipos_parametros WHERE ID = ?",
    "users": "DELETE FROM users WHERE ID = ?",
    "unidades": "DELETE FROM unidades WHERE ID = ?",
    "funcoes": "DELETE FROM funcoes WHERE ID = ?",
    "status": "DELETE FROM status WHERE ID = ?"
  };

  const { table, value } = req.query;

  if (!table || !value) {
    return res.status(400).json({ error: "Os parâmetros 'table' e 'value' são obrigatórios." });
  }

  const sql = queriesPermitidas[table];
  if (!sql) {
    return res.status(400).json({ error: `A tabela '${table}' não é válida para exclusão.` });
  }

  db.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Erro ao deletar registro:", err);
      return res.status(500).json({ error: "Erro ao deletar registro do banco de dados." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Nenhum registro encontrado para deletar." });
    }

    ajustarAutoIncrement((err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao ajustar o AUTO_INCREMENT." });
      }

      res.json({ message: "Registro deletado com sucesso e AUTO_INCREMENT ajustado." });
    });
  });
};
