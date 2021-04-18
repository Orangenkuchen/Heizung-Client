import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LogEventLevel } from 'serilogger';
import { IApiLogService, LogMessageOption } from 'src/app/serilogSinks/ApiSink';

/**
 * Service zum Kommunizieren mit der Web-API für Lognachrichten
 * 
 * In diesem Service sollten keine Lognachrichten gespeichert werden,
 * da damit eine Recusion erzeugt werden kann
 */
@Injectable({
  providedIn: 'root'
})
export class LogApiService implements IApiLogService
{
    // #region fields
    /**
     * Die BasisURL von der Web-API
     */
    private apiURL: string = "http://localhost:5000/Log"; //http://***REMOVED***:8080/Log

     /**
      * Service zum ausführen von HTTP-Requests
      */
    private httpClient: HttpClient;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param httpClient Service zum ausführen von HTTP-Requests
     */
    public constructor(httpClient: HttpClient)
    {
        this.httpClient = httpClient;
    }
    // #endregion

    // #region GetMinimumLogLevel
    /**
     * Ermittelt den minimum Level von Lognachrichten, welche vom Server angnommen werden
     * 
     * @returns Gibt den minimum Loglevel zurück
     */
     public GetMinimumLogLevel(): Observable<LogEventLevel> 
     {
        let url = this.apiURL + "/MinimumLevel";
        
        return this.httpClient.get<LogEventLevel>(url);
    }
    // #endregion

    // #region AddMessage
    /**
     * Sendet eine Lognachricht an den Server, damit dieser diese Speichert
     * 
     * @param clientIdentification Die Identifikation vom User. Diese wird selbst vom Client vergeben und dient dazu, dass der Server die Anfragen nachvolziehen kann.
     * @param clientLogLevel Der Level von der Lognachricht
     * @param message Die Lognachricht welche gespeichert werden soll. Sollte nicht den Timestamp und den Loglevel beinhalten
     * @param options Die Parameter von der Lognachricht
     * @returns Gibt Ok zurück, oder die einen Fehler, wenn der Minimumlevel höher ist als die gesendete Nachricht
     */
    public AddMessage(
        clientIdentification: string, 
        clientLogLevel: LogEventLevel, 
        message: string, 
        options: LogMessageOption): Observable<void>  
    {
        let url = this.apiURL + "/Message";

        let httpParams = new HttpParams();
        httpParams = httpParams.append('clientIdentification', clientIdentification);
        httpParams = httpParams.append('clientLogLevel', clientLogLevel.toString());
        httpParams = httpParams.append('message', message);

        return this.httpClient.post<void>(url, options, { params: httpParams });
    }
    // #endregion
}