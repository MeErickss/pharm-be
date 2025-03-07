import db from "../config/db.js";

const inserts = [
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

export async function insertInitialData() {
  for (const query of inserts) {
    try {
      await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
      console.log("Query executada com sucesso:", query);
    } catch (err) {
      console.error("Erro ao inserir dados:", err);
    }
  }
}
