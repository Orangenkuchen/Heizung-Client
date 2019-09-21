import { ServerToClientCommandType } from './ServerToClientCommandType';

export interface ServerToClientCommand<T> {
    /**
     * Der Command-Typ
     */
    commandType: ServerToClientCommandType;

    /**
     * Das Dataobject vom Command
     */
    dataObject: T;
}