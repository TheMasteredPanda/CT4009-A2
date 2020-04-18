"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseManager = __importStar(require("../managers/databaseManager"));
const sequelize_1 = require("sequelize");
class Contact extends sequelize_1.Model {
}
Contact.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    contact_value: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    contact_type: {
        type: sequelize_1.DataTypes.ENUM("email", "phone_personal", "phone_business"),
        allowNull: false,
        defaultValue: "email",
    },
    contact_hierarchy_position: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, { sequelize: databaseManager.sequelize(), modelName: "users_contacts" });
exports.default = databaseManager.sequelize().models.users_contacts;
