import db from "../config/db.js";

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