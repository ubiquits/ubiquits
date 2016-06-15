import { Injectable } from '@angular/core';
import * as Sequelize from 'sequelize';
import {
  Model, ModelStatic, identifier, ModelSchema,
  UUID
} from '../../common/models/model';
import { Database } from '../services/database.service';
import { Model as SequelizeModel } from 'sequelize';
import { Logger } from '../../common/services/logger.service';
import { DefineAttributes } from 'sequelize';
import { DataTypeAbstract } from 'sequelize';
import { Store } from '../../common/stores/store';
import { Instance } from 'sequelize';
import { Collection } from '../../common/models/collection';

/**
 * This store is for saving and retrieving models from the database using Sequelize
 */
@Injectable()
export abstract class DatabaseStore<T extends Model> extends Store<T> {

  /**
   * The `Sequelize` `Model` instance
   */
  protected orm: SequelizeModel<any, any>;

  /**
   * Logger for the class, initialized with source
   */
  protected logger: Logger;

  constructor(modelStatic: ModelStatic<T>, protected database: Database, protected loggerBase: Logger) {
    super(modelStatic);
    this.logger = loggerBase.source('DB Store');
    this.orm    = this.initializeOrm(modelStatic);

    this.orm.sync();
  }

  /**
   * With the static model create a Sequelize model
   * @param modelStatic
   * @returns {Model<TInstance, TAttributes>}
   */
  protected initializeOrm(modelStatic: ModelStatic<T>): any/*SequelizeModel<any, any>*/ {
    const schema: DefineAttributes = this.parseSchema(modelStatic);

    this.logger.debug(`Registering ${modelStatic.modelName} with schema`, schema);

    return this.database.getDriver()
      .define(modelStatic.modelName, schema, {
        schema: process.env.SCHEMA
      });
  }

  /**
   * Parse the modelStatic to get the schema that Sequelize understands
   * @param modelStatic
   * @returns {DefineAttributes}
   */
  protected parseSchema(modelStatic: ModelStatic<T>): DefineAttributes {
    const schema: DefineAttributes = {};

    let pk     = modelStatic.identifierKey;
    let pkType = Reflect.getMetadata("design:type", modelStatic.prototype, pk);

    let type: DataTypeAbstract;
    switch (pkType) {
      case String:
        type = Sequelize.STRING;
        break;
      case Number:
        type = Sequelize.NUMBER;
        break;
      case UUID:
        type = Sequelize.UUID;
        break;
    }

    schema[pk] = {primaryKey: true, type};

    return schema;
  }

  /**
   * Retrieve a record
   * @param id
   * @return {Promise<TResult>}
   */
  public findOne(id: identifier): Promise<T> {
    return this.orm.findOne({
        where: {
          [this.modelStatic.identifierKey]: id
        }
      })
      .then((modelData: Instance<any>): T => {
        return new this.modelStatic(modelData.get());
      })
      .catch((e) => {
        // @todo check if not found, if so throw NotFound exception
        this.logger.error(e);
        throw e;
      });
  }

  /**
   * Retrieve a set of records
   * @returns {Promise<Collection<any>>}
   * @param query
   */
  public findMany(query?:any): Promise<Collection<T>> {
    return this.orm.findAll({
      //@todo define query and restrict count with pagination
      })
      .then((modelCollection: Instance<any>[]): Collection<T> => {
        return new Collection(modelCollection.map((modelData):T => new this.modelStatic(modelData.get())));
      })
      .catch((e) => {
        // @todo check if not found, if so throw NotFound exception
        this.logger.error(e);
        throw e;
      });
  }

}