import createTables from "./createTables.js";
import insertInitialData from "./insertInitialData.js";

const initializeDatabase = async () => {
  try {
    await createTables();
    await insertInitialData();
    console.log("Banco de dados inicializado.");
  } catch (err) {
    console.error("Erro ao inicializar banco de dados:", err);
  }
};

export default initializeDatabase;
