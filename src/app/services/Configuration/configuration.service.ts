import { Injectable } from '@angular/core';

/**
 * Servcie welche die Konfigration von der Anwendung beinhaltet
 */
@Injectable({
    providedIn: 'root'
})
export class ConfigurationService 
{
    // #region ctor
    /**
     * Initialisiert den Service
     */
    constructor() 
    {
        this.ApiAdress = "http://<Ersetzten>"
    }
    // #endregion

    // #region ApiAdress
    /**
     * Die Adresse von der Api
     */
    public readonly ApiAdress: string;
    // #endregion
}
