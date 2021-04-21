/**
 * Klasse für die Beschrebiung von einem Heizungswert
 */
export interface ValueDescription {
    /**
     * Die Id vom Heizungswert
     */
    id: number;
    /**
     * Die Beschreibung des Heizungswerts
     */
    description: string;
    /**
     * Gibt an, ob der Heizungswert geloggt wird.
     */
    isLogged: boolean;
    /**
     * Die Einheit von einem Heizungswert
     */
    unit: string;
}