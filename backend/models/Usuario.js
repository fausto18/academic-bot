// backend/models/Usuario.js
import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Usuario = sequelize.define("Usuario", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aprovado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "usuarios",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

export default Usuario;
