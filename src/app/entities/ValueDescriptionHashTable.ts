import { ValueDescription } from "./ValueDescription";

/**
 * Hashtable mit ValueDescriptions (Die Id ist der Key von der Hashtable)
 */
export interface ValueDescriptionHashTable {
    [valueTypeId: number]: ValueDescription;
}