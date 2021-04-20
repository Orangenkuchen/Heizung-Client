/**
 * Beinhaltet die Betriebstunden der Heizung vom Tag
 */
export class DayOperatingHoures
{
    // #region date
    /**
     * Der Tag von dem die Betriebsstunden stammen
     */
    public date: Date;
    // #endregion
    
    // #region houres
    /**
     * Die Anzahl der Stunden, wie lang die Heizung an diesem Tag gebrannt hat
     */
    public houres: number;
    // #endregion

    // #region minHoures
    /**
     * Die Anzahl der Betriebstunden am Anfang des Tages
     */
    public minHoures: number;
    // #endregion

    // #region maxHoures
    /**
     * Die Anzahl der Betriebstunden am Ende des Tages
     */
    public maxHoures: number;
    // #endregion
}