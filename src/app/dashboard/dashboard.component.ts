import { Component, OnInit, ɵisBoundToModule__POST_R3__, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import * as Moment from 'moment-timezone';
import { CurrentDataService } from '../services/CurrentDataService/current-data.service';
import { Logger } from 'serilogger';
import { LoggerService } from '../services/Logger/logger.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  encapsulation : ViewEncapsulation.None
})
export class DashboardComponent implements OnInit 
{
    // #region fields
    /**
     * Servcie für die aktuellen Daten von der Heizung
     */
    private currentDataService: CurrentDataService;

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
        this.currentDataService = currentDataService;
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

    // #region temperatureToString
    /**
     * Fügt an die Zahl "°C" an
     * 
     * @param number Die Zahl an welche die Zeichenfolge gehängt werden soll
     */
    public temperatureToString(number: Number): String
    {
        return number + "°C";
    }
    // #endregion
}