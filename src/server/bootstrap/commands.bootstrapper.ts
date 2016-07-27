/**
 * @module server
 */
/** End Typedoc Module Declaration */
import { EntityBootstrapper } from './entity.bootstrapper';
import { RegistryEntityStatic, EntityMetadata } from '../../common/registry/entityRegistry';
import { CliCommand } from '../services/remoteCli/commands/index';
import { RemoteCli } from '../services/remoteCli/remoteCli.service';

/**
 * Provides bootstrapping of the @[[Command]] entities
 */
export class CommandBootstrapper extends EntityBootstrapper {

  /**
   * Returns all commands registered to the [[EntityRegistry]]
   */
  public getInjectableEntities(): RegistryEntityStatic<EntityMetadata>[] {
    return this.getEntitiesFromRegistry('command');
  }

  /**
   * Bootstrap all commands. With each command, the initialize function is invoked, and the bootstrap
   * awaits all commands to complete initializing before resolving the promise
   * @returns {Promise<any>|Promise<AbstractCommand[]>}
   */
  public bootstrap(): Promise<void> {

    this.logger.debug(`Initializing [${this.entities.length}] commands`);

    const remoteCli:RemoteCli = this.injector.get(RemoteCli);

    const allCommandPromises = this.entities.map((resolvedCommand: RegistryEntityStatic<EntityMetadata>) => {

      let command = this.getInstance<CliCommand>(resolvedCommand);

      return Promise.resolve(remoteCli.registerCommand(command));
    }, []);

    return Promise.all(allCommandPromises);
  }

}
