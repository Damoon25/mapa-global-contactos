const dotenv = require("dotenv");
const app = require("./app");
const pool = require("./config/db");

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Conexión a MySQL exitosa");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error conectando a MySQL:", error.message);
  }
};

startServer();