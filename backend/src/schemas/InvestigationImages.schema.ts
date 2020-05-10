import * as databaseManager from "../managers/databaseManager";
import { Model, DataTypes } from "sequelize";

/**
 * A junction table relating an investigation to an image entry.
 */
class InvestigationImages extends Model {}

InvestigationImages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "investigation_images" }
);

export default databaseManager.sequelize().models.investigation_images;
