import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Logger } from 'serilogger';
import { DayOperatingHoures } from '../entities/DayOperatingHoures';
import { HeaterDataService } from '../services/HeaterData/heater-data.service';
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
    public heaterDataService: HeaterDataService;

    /**
     * Service für Lognachrichten
     */
    private logger: Logger;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param heaterDataService Service zum Ermittlen von den Heizungsdaten von der API
     * @param loggerService Service für Lognachrichten
     */
    public constructor(heaterDataService: HeaterDataService, loggerService: LoggerService)
    {
        this.heaterDataService = heaterDataService;
        this.logger = loggerService.Logger;

        this.logger.debug("Run-Time-Component initialisiert (Konstruktor)");
    }
    // #endregion

    // #region ngOnInit
    /**
     * Diese Funtion wird von Angular beim Intitieren der Componente ausgeführt
     */
    public ngOnInit(): void 
    {
        let currentMoment = moment();
        let to = currentMoment.toDate();
        let from = currentMoment.add(-1, 'month').toDate();
        
        this.logger.info("Ermittelt die Betriebstunden im Zeitraum von {0} bis {1}", from, to);
        this.displayOperatingHouresPromise = this.heaterDataService.GetOperatingHoures(from, to);
        this.logger.debug("Run-Time initialisiert (Angular ngOnInit)");
    }
    // #endregion

    // #region displayOperatingHouresPromise
    /**
     * Der Array der Betriebsstunden, welcher aktuell angezeigt wird
     */
     public displayOperatingHouresPromise: Observable<Array<DayOperatingHoures>>;
     // #endregion
}
