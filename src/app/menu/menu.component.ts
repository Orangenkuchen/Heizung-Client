import { Component, OnInit } from '@angular/core';
import { Logger } from 'serilogger';
import { LoggerService } from '../services/Logger/logger.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.less']
})
export class MenuComponent implements OnInit
{
    // #region filelds
    /**
     * Service für Lognachrichten
     */
      private logger: Logger;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param loggerService Service für Lognachrichten
     */
    public constructor(loggerService: LoggerService)
    {
        this.logger = loggerService.Logger;

        this.logger.debug("Menu-Component initialisiert (Konstruktor)");
    }
    // #endregion

    // #region ngOnInit
    /**
     * Diese Funtion wird von Angular beim Intitieren der Componente ausgeführt
     */
    public ngOnInit(): void {
        this.logger.debug("Menu-Component initialisiert (Angular ngOnInit)");
    }
    // #endregion
}
