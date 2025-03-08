import db from "../config/db.js";


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