/**
 * @module server
 */
/** End Typedoc Module Declaration */
import { LogTailCommand } from './logTail.command';
export interface CliCommand {

  register(vantage:any):this;

}

export const CORE_COMMANDS = [
  LogTailCommand,
];
