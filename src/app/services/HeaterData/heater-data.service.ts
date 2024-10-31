import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Logger } from 'serilogger';
import { LoggerService } from '../Logger/logger.service';
import { HeaterDataHashMap } from '../CurrentDataService/current-data.service';
import { ConfigurationService } from '../Configuration/configuration.service';
import { DayOperatingHoures } from '../../entities/DayOperatingHoures';
import { LoggingState } from '../../entities/LoggingState';
import { ValueDescriptionHashTable } from '../../entities/ValueDescriptionHashTable';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

/**
 * Service zum Kommunizieren mit der Web-API für Heizungsdaten und SingalR-Connections
 */
@Injectable({
  providedIn: 'root'
})
export class HeaterDataService 
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
     * Die BasisURL vom SignalR-Hub für Heizungsdaten
     */
    private readonly signalRHubURL: string;

    /**
     * Service zum ausführen von HTTP-Requests
     */
    private readonly httpClient: HttpClient;

    /**
     * Service für Lognachrichten
     */
    private readonly logger: Logger;

    /**
     * SingalR-Hub-Connection für Heizungsdaten
     */
    private readonly heaterDataSingalRHubConnection: HubConnection;
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
        this.configurationService = configurationService;
        this.apiURL = this.configurationService.ApiAdress + "/HeaterData";
        this.signalRHubURL = this.configurationService.ApiAdress + "/HeaterDataHub";

        this.httpClient = httpClient;
        this.logger = loggerService.Logger;

        // Intialisiert die Klasse
        this.heaterDataSingalRHubConnection = new HubConnectionBuilder()
            .withUrl(this.signalRHubURL)
            .build();

        // Versucht die Verbindung mit dem Hub herzustellen
        this.heaterDataSingalRHubConnection
            .start()
            .then(() => 
                {
                    this.logger.info("Connection with SignalR-Hub for HeaterData established");
                })
            .catch((error: any) => 
                {
                    this.logger.error(new Error(error), "Error while starting connection with SignalR-Hub for HeaterData: ");
                });
    }
    // #endregion
 
    // #region GetValueDescriptions
    /**
     * Ermittelt die Beschreibungen zu den Heizungsdaten
     * 
     * @returns Gibt die Daten als HashTable zurück
     */
    public GetValueDescriptions(): Observable<ValueDescriptionHashTable>  {
        let url = this.apiURL + "/ValueDescriptions";
        this.logger.verbose("HeaterDataService: GetValueDescriptions wird bei der API angefragt. (GET; URL: {url})", url);
        return this.httpClient.get<ValueDescriptionHashTable>(url);
    }
    // #endregion

    // #region Get
    /**
     * Ermittelt die Heizungsdaten im angegeben Zeitraum
     * 
     * @param fromDate Der Startzeitpunkt der Datenbeschaffung
     * @param toDate Der Endzeitpunkt der Datenbeschaffung
     * @returns Gibt eine Hashtable mit den Daten zurück
     */
    public Get(fromDate: Date, toDate: Date): Observable<HeaterDataHashMap>  {
        let params = new HttpParams();
        let url = this.apiURL + "/Data";

        this.logger.verbose("HeaterDataService: Get wird bei der API angefragt. (GET; URL: {url}; fromDate: {fromDate}; toDate {toDate})", url, fromDate, toDate);

        // Begin assigning parameters
        params = params.append('fromDate', fromDate.toISOString());
        params = params.append('toDate', toDate.toISOString());

        return this.httpClient.get<HeaterDataHashMap>(
            url, 
            {
                "params": params
            });
    }
    // #endregion

    // #region GetLatests
    /**
     * Ermittelt die Heizungsdaten welche zuletzt ermittelt wurden
     * 
     * @returns Gibt eine Hashtable mit den Daten zurück
     */
    public GetLatests(): Observable<HeaterDataHashMap>  {
        let url = this.apiURL + "/Latest";

        this.logger.verbose("HeaterDataService: GetLatest wird bei der API angefragt. (GET; URL: {url})", url);

        return this.httpClient.get<HeaterDataHashMap>(url);
    }
    // #endregion

    // #region SetLoggingState
    /**
     * Stellt ein, welche Daten in der Historie aufgezeichnet werden
     * 
     * @param loggingStates Die Heizungsdaten welche gesetzt werden sollen
     * @returns Gibt ein Observable, vom API-Aufruf
     */
    public SetLoggingState(loggingStates: Array<LoggingState>): Observable<Object>  {
        let url = this.apiURL + "/SetLoggingState";

        this.logger.verbose("HeaterDataService: SetLoggingState wird bei der API angefragt. (PUT; URL: {0}, LoggingState: {1})", url, loggingStates);
        return this.httpClient.put(url, loggingStates);
    }
    // #endregion

    // #region GetOperatingHoures
    /**
     * Ermittelt die Betriebsstunden im angegebenen Zeitraum
     * 
     * @param fromDate Der Startzeitpunkt der Datenbeschaffung
     * @param toDate Der Endzeitpunkt der Datenbeschaffung
     * @returns Gibt einen Array zurück
     */
     public GetOperatingHoures(fromDate: Date, toDate: Date): Observable<Array<DayOperatingHoures>>  {
        let params = new HttpParams();
        let url = this.apiURL + "/OperatingHoures";

        this.logger.verbose("HeaterDataService: GetOperatingHoures wird bei der API angefragt. (GET; URL: {url}; fromDate: {fromDate}; toDate {toDate})", url, fromDate, toDate);

        // Begin assigning parameters
        params = params.append('fromDate', fromDate.toISOString());
        params = params.append('toDate', toDate.toISOString());

        return this.httpClient.get<Array<DayOperatingHoures>>(
            url, 
            {
                "params": params
            });
    }
    // #endregion
    
    // #region AddCurrentHeaterDataListeninger
    /**
     * Fügt einen Listener hinzu, welcher aufgerufen wird, wenn neue Heizungsdaten vom Server ankommen sind
     * 
     * @param listener Diese Funktion wird aufgerufen, wenn neue Heizungsdaten vom Server angekommen sind
     * @returns Gibt eine Funktion zum Deabonieren zurück
     */
    public AddCurrentHeaterDataListeninger(listener: (currentHeaterData: HeaterDataHashMap) => void): () => void
    {
        this.heaterDataSingalRHubConnection.on('CurrentHeaterData', listener);

        return () => this.heaterDataSingalRHubConnection.off('CurrentHeaterData', listener);
    }
    // #endregion
}
