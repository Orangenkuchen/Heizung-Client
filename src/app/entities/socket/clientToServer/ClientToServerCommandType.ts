export enum ClientToServerCommandType {
    /**
     * Command zum ermitteln von allen Daten (in einem Zeitraum)
     */
    RequestAllDataCommand = 1,
    
    /**
     * Command zum Einstellen davon, welche Werte geloggt werden sollen
     */
    SetLoggingStateCommand = 2,

    /**
     * Command zum Anfordern der Konfiguration von der Mail-Benachrichtigung
     */
    RequestMailNotifierConfigCommand = 3,

    /**
     * Command zum Speichern von der Mail-Benachrichtigung-Konfig
     */
    SaveMailNotifierConfigCommand = 4,

    /**
     * Command zum ermitteln vder neusten Daten
     */
    RequestNewestDataCommand = 5
}