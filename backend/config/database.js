import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.DataBase_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
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
