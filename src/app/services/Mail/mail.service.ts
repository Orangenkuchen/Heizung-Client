import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotifierConfig } from 'src/app/entities/NotifierConfig';
import { Logger } from 'serilogger';
import { LoggerService } from '../Logger/logger.service';
import { ConfigurationService } from '../Configuration/configuration.service';

/**
 * Service zum Kommunizieren mit der Web-API für Mailkonfiguration
 */
@Injectable({
  providedIn: 'root'
})
export class MailService 
{
    // #region fields
    /**
     * Dieser Service beinhaltet die Konfiguration von der Anwendung
     */
    private readonly configurationService: ConfigurationService;
    
    /**
     * Die BasisURL von der Web-API
     */
    private readonly apiURL: string;

    /**
     * Service zum ausführen von HTTP-Requests
     */
    private readonly httpClient: HttpClient;

    /**
     * Service für Lognachrichten
     */
    private readonly logger: Logger;
    // #endegion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param httpClient Service zum ausführen von HTTP-Requests
     * @param loggerService Service für Lognachrichten
     * @param configurationService Dieser Service beinhaltet die Konfiguration von der Anwendung
     */
    public constructor(
        httpClient: HttpClient, 
        loggerService: LoggerService,
        configurationService: ConfigurationService)
    {
        this.httpClient = httpClient;
        this.logger = loggerService.Logger;
        
        this.configurationService = configurationService;
        this.apiURL = this.configurationService.ApiAdress + "/Mail";
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
