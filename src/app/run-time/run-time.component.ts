import { Component, OnInit } from '@angular/core';
import { Logger } from 'serilogger';
import { CurrentDataService } from '../services/CurrentDataService/current-data.service';
import { LoggerService } from '../services/Logger/logger.service';

@Component({
  selector: 'app-run-time',
  templateUrl: './run-time.component.html',
  styleUrls: ['./run-time.component.less']
})
export class RunTimeComponent implements OnInit 
{
    // #region filelds
    /**
     * Servcie für die aktuellen Daten von der Heizung
     */
    public currentDataService: CurrentDataService;

    /**
     * Service für Lognachrichten
     */
    private logger: Logger;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param currentDataService Servcie für die aktuellen Daten von der Heizung
     * @param loggerService Service für Lognachrichten
     */
    public constructor(currentDataService: CurrentDataService, loggerService: LoggerService)
    {
        this.currentDataService = currentDataService;
        this.logger = loggerService.Logger;

        this.logger.debug("Run-Time-Component initialisiert (Konstruktor)");
    }
    // #endregion

    // #region ngOnInit
    /**
     * Diese Funtion wird von Angular beim Intitieren der Componente ausgeführt
     */
    public ngOnInit(): void {
        this.logger.debug("Run-Time initialisiert (Angular ngOnInit)");
    }
    // #endregion
}
