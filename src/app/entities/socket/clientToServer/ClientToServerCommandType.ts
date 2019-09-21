export enum ClientToServerCommandType {
    /**
     * Command zum ermitteln von allen Daten (in einem Zeitraum)
     */
    RequestAllDataCommand = 1,
    
    /**
     * Command zum Einstellen davon, welche Werte geloggt werden sollen
     */
    SetLoggingStateCommand = 2
}