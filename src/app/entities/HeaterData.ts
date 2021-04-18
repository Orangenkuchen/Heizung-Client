/**
 * Daten für einen Typ von Heizungsdaten
 */
export interface HeaterData {
    /**
     * Die Id vom Heizwerttyp
     */
    valueTypeId: number;
    
    /**
     * Die Beschreibung vom Heizwert
     */
    description: string;

    /**
     * Gibt an ob der Heizwert gelogged wird
     */
    isLogged: Boolean;

    /**
     * Die Einheit des Werts
     */
    unit: String;

    /**
     * Die Daten für den Heizwert
     */
    data: Array<{timestamp: Date, value: number}>;
}