import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Logger } from 'serilogger';
import { CurrentDataService } from '../services/CurrentDataService/current-data.service';
import { LoggerService } from '../services/Logger/logger.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.less',
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit
{
    // #region fields
    /**
     * Service für Lognachrichten
     */
     private logger: Logger;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Componente
     * 
     * @param currentDataService Servcie für die aktuellen Daten von der Heizung
     * @param loggerService Service für Lognachrichten
     */
    public constructor(currentDataService: CurrentDataService, loggerService: LoggerService) 
    {
        this.CurrentDataService = currentDataService;
        this.logger = loggerService.Logger;

        this.logger.debug("Dashboard-Component initialisiert (Konstruktor)");
    }
    // #endregion

    // #region ngOnInit
    /**
     * Diese Funtion wird von Angular beim Intitieren der Componente ausgeführt
     */
    public ngOnInit(): void {
        this.logger.debug("Dashboard-Component initialisiert (Angular ngOnInit)");
    }
    // #endregion

    // #region CurrentDataService
    /**
     * Servcie für die aktuellen Daten von der Heizung
     */
    public CurrentDataService: CurrentDataService;
    // #endregion

    // #region temperatureToString
    /**
     * Fügt an die Zahl "°C" an
     * 
     * @param number Die Zahl an welche die Zeichenfolge gehängt werden soll
     */
    public temperatureToString(number: number): string
    {
        return number + "°C";
    }
    // #endregion
}