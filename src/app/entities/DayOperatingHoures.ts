/**
 * Beinhaltet die Betriebstunden der Heizung vom Tag
 */
export interface DayOperatingHoures
{
    // #region date
    /**
     * Der Tag von dem die Betriebsstunden stammen
     */
    date: Date;
    // #endregion
    
    // #region houres
    /**
     * Die Anzahl der Stunden, wie lang die Heizung an diesem Tag gebrannt hat
     */
    houres: number;
    // #endregion

    // #region minHoures
    /**
     * Die Anzahl der Betriebstunden am Anfang des Tages
     */
    minHoures: number;
    // #endregion

    // #region maxHoures
    /**
     * Die Anzahl der Betriebstunden am Ende des Tages
     */
    maxHoures: number;
    // #endregion
}