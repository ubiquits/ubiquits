/**
 * @module browser
 */
/** End Typedoc Module Declaration */
import { Injectable, Injector } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AbstractStore } from '../../common/stores/store';
import { identifier, ModelStatic, AbstractModel } from '../../common/models/model';
import { Logger } from '../../common/services/logger.service';
import { Collection } from '../../common/models/collection';
import 'rxjs/add/operator/toPromise';

/**
 * HttpStore store should be extended with a specific implementation for a model. Interacts with
 * the backend over the REST API using Angular's Http service
 */
@Injectable()
export abstract class HttpStore<T extends AbstractModel> extends AbstractStore<T> {

  protected logger: Logger;

  constructor(modelStatic: ModelStatic<T>, injector:Injector, protected http: Http, loggerBase: Logger) {
    super(modelStatic, injector);
    this.logger = loggerBase.source('HTTP Store');
  }

  /**
   * Get the rest endpoint for the model
   * @param id
   * @returns {string}
   */
  protected endpoint(id?: identifier): string {

    let endpoint = `${process.env.API_BASE}/${this.modelStatic.getMetadata().storageKey}`;

    if (id) {
      endpoint += `/${id}`;
    }
    return endpoint;
  };

  /**
   * @inheritdoc
   */
  public async findOne(id: identifier): Promise<T> {

    try {
      const res: Response = await this.http.get(this.endpoint(id)).toPromise();
      await this.checkStatus(res);
      return this.extractModel(res);
    } catch (e) {
      return this.handleError(e);
    }

  }

  /**
   * @inheritdoc
   */
  public async findMany(query?:any):Promise<Collection<T>> {

    try {
      const res: Response = await this.http.get(this.endpoint()).toPromise();
      await this.checkStatus(res);
      return this.extractCollection(res);
    } catch (e) {
      return this.handleError(e);
    }

  }

  /**
   * @inheritdoc
   */
  public async saveOne(model:T):Promise<T> {
    //@todo consider toJson method if custom serializing is needed?
    //@todo extract only changed properties
    //@todo switch on if existing and decide if put or patch request
    try {
      const url = this.endpoint(model.getIdentifier());
      const res: Response = await this.http.put(url, model).toPromise();
      await this.checkStatus(res);
      return model; //@todo flag model as existing
    } catch (e) {
      return this.handleError(e);
    }

  }

  /**
   * @inheritdoc
   */
  public async deleteOne(model: T): Promise<T> {

    try {
      const url = this.endpoint(model.getIdentifier());
      const res: Response = await this.http.delete(url).toPromise();
      await this.checkStatus(res);
      return model; //@todo flag model as not existing
    } catch (e) {
      return this.handleError(e);
    }

  }

  /**
   * @inheritdoc
   */
  public async hasOne(model: T): Promise<boolean> {

    try {
      const url = this.endpoint(model.getIdentifier());
      const res: Response = await this.http.delete(url).toPromise();
      await this.checkStatus(res);
      return true;
    } catch (e) {
      return false; //@todo assert notfound exception
    }

  }

  /**
   * Extract model from the payload
   * @param res
   * @returns {T}
   */
  private extractModel(res: Response): T {
    let body = res.json();
    return new this.modelStatic(body);
  }

  /**
   * Extract collection of models from the payload
   * @param res
   * @returns {Collection<T>}
   */
  private extractCollection(res: Response): Collection<T> {
    let body = res.json();
    return new Collection<T>(body.map((modelData:Object) => new this.modelStatic(modelData)));
  }

  /**
   * Handle any exceptions
   * @param error
   * @returns {Promise<void>|Promise<T>}
   */
  private handleError(error: any) {
    let message:any;

    if (error instanceof Response){
      message = error.json();
      if (message.message){
        message = message.message;
      }
    } else {
      message = error.message;
    }

    let errMsg = (message) ? message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';

    this.logger.error(errMsg);
    return Promise.reject(errMsg);
  }

  /**
   * Check the status is ok.
   * This only seems to be required for unit testing @todo resolve why there is a discrepancy
   * @param res
   * @returns {any}
   */
  private checkStatus(res: Response): Response|Promise<any> {
    if (res.ok){
      return res;
    }

    return Promise.reject(res);
  }
}
