import { HeaterData } from "./HeaterData";

/**
 * Hashtable mit Heizungsdaten
 */
export interface HeaterDataHashtable {
    [valueTypeId: number]: HeaterData;
}