import * as databaseManager from "../managers/databaseManager";
import { Model, DataTypes } from "sequelize";

/**
 * A junction table relating an image entry to a registered bike.
 */
class RegistryImages extends Model {}

RegistryImages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "registry_images" }
);

export default databaseManager.sequelize().models.registry_images;
