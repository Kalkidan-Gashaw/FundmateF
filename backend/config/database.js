import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = process.env.DATABASE_URL || process.env.DataBase_URL
  ? new Sequelize(process.env.DATABASE_URL || process.env.DataBase_URL, {
      dialect: "postgres",
      logging: false,
      ssl: true,
      native: true,
    })
  : new Sequelize(
      process.env.PGDATABASE || process.env.DB_NAME,
      process.env.PGUSER || process.env.DB_USER,
      process.env.PGPASSWORD || process.env.DB_PASSWORD,
      {
        host: process.env.PGHOST || process.env.DB_HOST,
        port: process.env.PGPORT || process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: false,
      },
    );

export default sequelize;
