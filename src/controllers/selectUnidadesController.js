import db from "../config/db.js";


app.get("/api/selectunidade", (req, res) => {
    const verify = {
      "UNIDADE": "SELECT u.UNIDADE FROM unidades u LEFT JOIN medidas_unidades MU ON mu.ID_UNIDADE = u.ID LEFT JOIN medidas m ON m.ID = mu.ID_TIPO WHERE m.NOME = ?;"
    };
  
    const { value } = req.query; // Obtém os parâmetros da URL
  
    if (!value) {
      return res.status(400).send("Parâmetros insuficientes");
    }
  
    const sql = verify["UNIDADE"];
    if (!sql) {
      return res.status(400).send("Request inválida");
    }
  
    console.log(`Executando SQL: ${sql}`); // Debugging
  
    db.query(sql[value], (err, results) => {
      if (err) {
        console.error("Erro ao pegar dados:", err);
        return res.status(500).send("Erro ao pegar dados");
      }
  
      res.json(results);
    });
  });