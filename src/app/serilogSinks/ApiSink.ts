import { Observable } from "rxjs";
import { LogEvent, LogEventLevel, Sink } from "serilogger";
import { v4 } from 'uuid';

export interface AddLogmessageApiError
{
    // #region message
    /**
     * Die Die Fehlermeldung
     */
    message: string;
    // #endregion

    // #region minimumLogLevel
    /**
     * Der Minimumloglevel, welcher von der Api angenommen wird
     */
     minimumLogLevel: LogEventLevel;
     // #endregion
}

export interface LogMessageOption
{
    // #region Parameters
    /**
     * Die Parameter von der Lognachricht
     */
    Parameters: Array<string>;
    // #endregion

    // #region Error
    /**
     * Der Fehler, welcher beim Client aufgetreten ist
     */
    Error?: Object;
    // #endregion
}

export interface IApiLogService
{
    // #region GetMinimumLogLevel
    /**
     * Ermittelt den minimum Level von Lognachrichten, welche vom Server angnommen werden
     * 
     * @returns Gibt den minimum Loglevel zurück als string zurück. (Kann in LogEventLevel geparsed werden)
     */
     GetMinimumLogLevel(): Observable<string>;
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
    AddMessage(clientIdentification: string, clientLogLevel: LogEventLevel, message: string, options: LogMessageOption): Observable<void>;
    // #endregion
}

/**
 * Die Optionen vom ApiSink
 */
export interface ApiSinkOptions
{
    apiLoggerService: IApiLogService;
}

export class ApiSink implements Sink
{
    // #region fields
    /**
     * Service zum Loggen von Nachrichten auf dem Server
     */
    private readonly logService: IApiLogService;

    /**
     * Die UUID vom Client, welche zum Identifizieren der Session gegenüber dem Server beim Loggen verwendet wird
     */
    private readonly clientUUId: string;

    /**
     * Der miniumLevel, welcher vom Server angenommen wird
     */
    private serverMinimumLogLevel: LogEventLevel;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * @param apiSinkOptions Die Optionen vom Sink
     */
    public constructor(apiSinkOptions: ApiSinkOptions)
    {
        this.logService = apiSinkOptions.apiLoggerService;
        this.clientUUId = v4();

        this.logService.GetMinimumLogLevel()
                       .subscribe((serverMinimumLogLevel) =>
        {
            this.serverMinimumLogLevel = LogEventLevel[serverMinimumLogLevel.toLowerCase()];
        },(error) =>
        {
            throw error;
        });
    }
    // #endregion

    // #region emit
    /**
     * Fügt LogEvents dem Sink hinzu
     * 
     * @param events Die Events welche hinzugefügt werden sollen
     */
    public emit(events: LogEvent[]): void 
    {
        for (let index in events)
        {
            let event = events[index];

            if (event.level <= this.serverMinimumLogLevel)
            {
                let messageOptions: LogMessageOption = { Parameters: new Array<string>() };
                for (let paramName in event.properties)
                {
                    messageOptions.Parameters.push(event.properties[paramName]);
                }

                if (typeof event.error !== "undefined")
                {
                    messageOptions.Error = event.error;
                }

                this.logService.AddMessage(this.clientUUId, event.level, event.messageTemplate.raw, messageOptions)
                            .subscribe(
                    () => {}, 
                    (response) =>
                    {
                        if (response.status == 412)
                        {
                            let apiError = response.error as AddLogmessageApiError;
                            this.serverMinimumLogLevel = apiError.minimumLogLevel;
                        }
                    });
            }
        }
    }
    // #endregion

    // #region flush
    /**
     * Arbeitet alle Lognarichten welche noch gehalten wurden ab
     */
    public flush(): Promise<any> 
    {
        return Promise.resolve();
    }
    // #endregion
}
