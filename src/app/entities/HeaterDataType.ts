/**
 * Enum für die verschiedenen Datentypen welche empfangen werden können
 */
export enum HeaterDataType {
    /**
     * Der Status von der Heizung (Feuer an, ...)
     */
    Heizstatus = 1,
    Kesseltemperatur = 2,
    Abgastemperatur = 3,
    Kesselstrg = 4,
    Primärluft = 5,
    Rest_O2_ist = 6,
    O2_Regler = 7,
    Sekundärluft = 8,
    Saugzug_Soll = 9,
    Saugzug_Ist = 10,
    Abgastemperatur_S = 11,
    Einschub_Ist = 12,
    O2_Regler_Pell = 13,
    Füllstand = 14,
    Ansauggeschwindigkeit = 15,
    Strom_Austrags = 16,
    Fühler_1 = 17,
    Kesselsoll = 18,
    Puffer_oben = 20,
    Puffer_unten = 21,
    Pufferpumpe = 22,
    Boiler_1 = 23,
    Vorlauf_1 = 24,
    Vorlauf_2 = 25,
    Heizkreislauf_Pumpe_1 = 26,
    Heizkreislauf_Pumpe_2 = 27,
    Aussentemperatur = 28,
    Kollektortemp = 29,
    Betriebsstunden = 30,
    Fehler = 99,
    TuerOffenSeitFuerAus = 1000
}