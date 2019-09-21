import { ClientToServerCommandType } from './ClientToServerCommandType';

export interface IClientToServerDataObject {
  /**
   * Der Typ vom Command
   */
  commandType: ClientToServerCommandType;
  
  /**
   * Die Daten vom Command
   */
  dataObject: any;
}