import mysql, { ResultSetHeader } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
// Définition de l'interface pour le résultat attendu
interface QueryResult extends ResultSetHeader {
  [key: string]: any;
}

// Création d'une pool de connexions à la base de données
// On va utiliser les variables définies dans .env (injectées dans process.env)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

// Fonction helper pour exécuter des requêtes SQL
export async function query(
  sqlString: string,
  params: any[] = []
): Promise<QueryResult[]> {
  try {
    const [rows] = await pool.execute<QueryResult[]>(sqlString, params);
    return rows;
  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête SQL :", error);
    throw error;
  }
}
