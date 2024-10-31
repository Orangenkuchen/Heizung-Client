import { ErrorHandler } from "@angular/core";
import { Logger } from "serilogger";
import { LoggerService } from "../../services/Logger/logger.service";

/**
 * Klasse welche bei Angular-Fehlern das Logging über Serilog ausführt
 */
export class CustomErrorHandler implements ErrorHandler
{
    // #region fields
    /**
     * Serivce für Lognachrichten
     */
    private logger: Logger;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param loggerService Serivce für Lognachrichten
     */
    public constructor(loggerService: LoggerService)
    {
        this.logger = loggerService.Logger;
    }
    // #endregion

    // #region handleError
    /**
     * Wird aufgerufen, wenn Angular einen unhandled Fehler hat.
     * Wird hier per Serilog geloggt.
     * 
     * @param error Der Fehler welcher nicht abgefangen wurde
     */
    public handleError(error: any): void 
    {
        this.logger.error(error, "Angular hat eine unhandled exception geworfen: ");
    }
    // #endregion
}