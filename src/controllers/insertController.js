import db from "../config/db.js";

export const insertParametro = (req, res) => {
  const { PARAMETRO, MEDIDA, UNIDADE, FUNCAO, VALOR, VL_MAX, VL_MIN, STATUS } = req.body;

  if (!PARAMETRO || !MEDIDA || !UNIDADE) {
    return res.status(400).json({ error: "Parâmetros insuficientes. Necessário: PARAMETRO, MEDIDA, UNIDADE" });
  }

  const sqlInsertParametro = `
    INSERT INTO parametros (PARAMETRO, VALOR, VL_MAX, VL_MIN, STATUS) VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sqlInsertParametro, [PARAMETRO, VALOR, VL_MAX, VL_MIN, STATUS], (err, results) => {
    if (err) {
      console.error("Erro ao inserir parâmetro:", err);
      return res.status(500).json({ error: "Erro ao inserir parâmetro" });
    }

    const idParametro = results.insertId;

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

    Promise.all(insertQueries.map(({ sql, values }) => {
      return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
          if (err) {
            console.error("Erro ao associar:", err);
            return reject(err);
          }
          resolve(results);
        });
      });
    }))
      .then(() => {
        res.json({ message: "Parâmetro inserido com sucesso e relações criadas!" });
      })
      .catch((error) => {
        res.status(500).json({ error: "Erro ao associar parâmetros", details: error });
      });
  });
};
