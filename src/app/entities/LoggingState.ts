/**
 * Klasse, welche den Logstatus von einem Heizungswert darstellt
 */
 export interface LoggingState {
    /**
     * Die Id vom WerteTyp, für den die Klasse steht
     */
    valueTypeId: number;

    /**
     * Gibt an, ob der Wert für den diese Klasse steht in der Historie gespeichert werden soll
     */
    isLogged: Boolean;
}