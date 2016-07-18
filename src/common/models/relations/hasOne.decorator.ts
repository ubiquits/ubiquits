/**
 * @module common
 */
/** End Typedoc Module Declaration */
import { ModelStatic } from '../model';
import { initializeRelationMap, ForeignRelationModelGetter, Relation } from './index';
import { RelationOptions } from 'typeorm/decorator/options/RelationOptions';

/**
 * Defines the relationship between the current model and a foreign model vial the decorated key
 *
 * Example:
 * ```typescript
 *
 *  @Model
 *  class Hand extends AbstractModel {
 *
 *    @HasOne()
 *    public thumb: ThumbModel;
 *  }
 *
 * ```
 * Foreign model property is only required if there is no type annotation
 */
export function HasOne(foreignTypeGetter: ForeignRelationModelGetter, joinOptions?: RelationOptions): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initializeRelationMap(target, 'hasOne');

    target.constructor.__metadata.relations.get('hasOne')
      .set(propertyKey, new Relation(target.constructor, foreignTypeGetter, joinOptions));
  };
}
