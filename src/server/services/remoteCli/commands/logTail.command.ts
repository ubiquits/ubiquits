/**
 * @module server
 */
/** End Typedoc Module Declaration */
import { Logger, LogEvent } from '../../../../common/services/logger.service';
import { CliCommand } from './index';
import {Injectable} from '@angular/core';
import { Command } from '../../../../common/registry/decorators';

@Command()
@Injectable()
export class LogTailCommand implements CliCommand {

  constructor(protected logger:Logger) {}

  register(vantage:any):this {

    console.log('registering', LogTailCommand);

    const command = this;

    let subscription:any;

    vantage.command('logs')
      .description('tails log output')
      .action(function(args:any, cb:Function) {

        this.log('Connecting to log stream');

        subscription = command.logger.emitter().subscribe((logEvent:LogEvent) => {
          this.log(...logEvent.messages);
          console.log('message', ...logEvent.messages);
        });


        command.logger.alert('yea over here');

        this.log('subscribed');



      });

    vantage.command('logs stop')
      .description('stops tailing log output')
      .action(function(args:any, cb:Function) {

        this.log('disconnecting from log stream');

        subscription.unsubscribe();

        cb();


      });

    return this;
  }


}
