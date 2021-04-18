import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotifierConfig } from 'src/app/entities/NotifierConfig';
import { Logger } from 'serilogger';
import { LoggerService } from '../Logger/logger.service';

/**
 * Service zum Kommunizieren mit der Web-API für Mailkonfiguration
 */
@Injectable({
  providedIn: 'root'
})
export class MailService {
    // #region fields
    /**
     * Die BasisURL von der Web-API
     */
    private apiURL: string = "http://localhost:5000/Mail"; //http://***REMOVED***:8080/Mail

    /**
     * Service zum ausführen von HTTP-Requests
     */
    private httpClient: HttpClient;

    /**
     * Service für Lognachrichten
     */
    private logger: Logger;
    // #endegion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param httpClient Service zum ausführen von HTTP-Requests
     * @param loggerService Service für Lognachrichten
     */
    public constructor(httpClient: HttpClient, loggerService: LoggerService)
    {
        this.httpClient = httpClient;
        this.logger = loggerService.Logger;
    }
    // #endregion

    // #region GetConfiguration
    /**
     * Ermittelt die Mailkonfiguration von der API
     * 
     * @returns Gibt die Konfiguration zurück
     */
    public GetConfiguration(): Observable<NotifierConfig>  {
        let url = this.apiURL + "/Configuration";

        this.logger.verbose("MailServcie: Configuration wird bei der API angefragt. (GET; URL: {url})", url);
        return this.httpClient.get<NotifierConfig>(url);
    }
    // #endregion

    // #region PutConfiguration
    /**
     * Setzt die Konfiguration für die Mailbenachrichtigungen
     * 
     * @param notifierConfig Die Heizungsdaten welche gesetzt werden sollen
     * @returns Gibt ein Observable, vom API-Aufruf
     */
    public SetConfiguration(notifierConfig: NotifierConfig): Observable<Object>  {
        let url = this.apiURL + "/Configuration";

        this.logger.verbose("MailServcie: Configuration wird bei der API angefragt. (PUT; URL: {url}; NotifierConfig: {notifierConfig})", url, notifierConfig);

        return this.httpClient.put(url, notifierConfig);
    }
    // #endregion
}
