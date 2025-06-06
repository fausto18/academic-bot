// models/Usuario.js
import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Usuario = sequelize.define("Usuario", {
  primeiro_nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ultimo_nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  contacto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aprovado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: "usuarios",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

export default Usuario;
