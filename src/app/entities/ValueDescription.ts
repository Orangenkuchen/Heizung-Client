/**
 * Klasse für die Beschrebiung von einem Heizungswert
 */
export interface ValueDescription {
    /**
     * Die Id vom Heizungswert
     */
    Id: number;
    /**
     * Die Beschreibung des Heizungswerts
     */
    Description: string;
    /**
     * Gibt an, ob der Heizungswert geloggt wird.
     */
    IsLogged: boolean;
    /**
     * Die Einheit von einem Heizungswert
     */
    Unit: string;
}