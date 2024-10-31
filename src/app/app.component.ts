import { Component } from '@angular/core';
import { LoggerService } from './services/Logger/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {

  public constructor(loggerService: LoggerService)
  {

  }

  title = 'Heizungsdaten';
}
