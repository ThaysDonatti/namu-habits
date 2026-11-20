import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import { database } from '../config/database';

export class Habit extends Model<
  InferAttributes<Habit>,
  InferCreationAttributes<Habit>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string | null;
  declare frequency: 'diario' | 'semanal';
  declare category: 'saude' | 'exercicio' | 'alimentacao' | 'mental';
  declare createdAt: CreationOptional<Date>;
}

Habit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.ENUM('diario', 'semanal'),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'saude',
        'exercicio',
        'alimentacao',
        'mental'
      ),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize: database,
    tableName: 'habits',
    timestamps: false,
  }
);