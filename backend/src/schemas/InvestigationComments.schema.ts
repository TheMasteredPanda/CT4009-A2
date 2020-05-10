import { Model, DataTypes } from "sequelize";
import * as databaseManager from "../managers/databaseManager";

class InvestigationComments extends Model {}

InvestigationComments.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("civilian", "investigators"),
      allowNull: false,
      defaultValue: "civilian",
    },
  },
  {
    sequelize: databaseManager.sequelize(),
    modelName: "investigation_comments",
  }
);

export default databaseManager.sequelize().models.investigation_comments;