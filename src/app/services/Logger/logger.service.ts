import { Injectable } from '@angular/core';
import { Logger, LoggerConfiguration } from 'serilogger';
import { LogApiService } from '../LogApi/log-api.service';
import { ApiSink, IApiLogService } from '../../serilogSinks/ApiSink';
import { BrowserColoredConsoleSink } from '../../serilogSinks/BrowserColoredConsoleSink';

/**
 * Service für Lognachrichten
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {

    // #region ctor
    /**
     * Initialisiert die Klasse
     * @param logApiService API-Service für Lognachrichten am Server
     */
    public constructor(logApiService: LogApiService) 
    {
        const apiSinkPromsie: IApiLogService = logApiService;
        this.Logger = new LoggerConfiguration()
                        .writeTo(new BrowserColoredConsoleSink(
                            {
                                includeProperties: true,
                                includeTimestamps: true
                            }
                        ))
                        .writeTo(new ApiSink( { apiLoggerService: apiSinkPromsie } ))
                        .create();
    }
    // #endregion

    // #region Logger
    /**
     * Serilogger für Lognachrichten
     */
    public Logger: Logger
    // #endregion
}
