import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GaugeModule } from 'angular-gauge';
import { HistoryComponent } from './history/history.component';
import { MenuComponent } from './menu/menu.component';
import { RunTimeComponent } from './run-time/run-time.component';
import { MailNotifierSettingsComponent } from './mail-notifier-settings/mail-notifier-settings.component';
import { ValueOverviewComponent } from './value-overview/value-overview.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LoggerConfiguration, Logger } from 'serilogger';
import { CustomErrorHandler } from './entities/CustomErrorHandler/CustomErrorHandler';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RoutesRecognized } from '@angular/router';
import { LoggerService } from './services/Logger/logger.service';

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        HistoryComponent,
        MenuComponent,
        RunTimeComponent,
        MailNotifierSettingsComponent,
        ValueOverviewComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        GaugeModule.forRoot(),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [
        { provide: ErrorHandler, useClass: CustomErrorHandler, deps: [ LoggerService ] }
    ],
    bootstrap: [AppComponent]
})
export class AppModule 
{
    // #region fields
    /**
     * Router mit dem die Navigation in der Anwendung gemacht wird
     */
    private router: Router;

    /**
     * Service für Lognachrichten
     */
    private logger: Logger;
    // #endregion

    // #region ctor
    /**
     * Initialisiert das AppModule
     * 
     * @param router Router mit dem die Navigation in der Anwendung gemacht wird
     * @param loggerService Service für Lognachrichten
     */
    public constructor(router: Router, loggerService: LoggerService)
    {
        this.logger = loggerService.Logger;
        this.router = router;

        this.router.events.forEach(
            (event) =>
            {
                if (event instanceof NavigationStart)
                {
                    let navigationStartEvent = event as NavigationStart;
                    this.logger.info(
                        "Angular hat die Navigation gestartet. (Navigationsurl: {url})", 
                        navigationStartEvent.url);
                }
                else if  (event instanceof NavigationEnd)
                {
                    let navigationEndEvent = event as NavigationEnd;
                    this.logger.info(
                        "Angular hat die Navigation abgeschlossen. (Navigationsurl: {url}; UrlAfterRedirects: {urlAfterRedirects})", 
                        navigationEndEvent.url, 
                        navigationEndEvent.urlAfterRedirects);
                }
                else if  (event instanceof NavigationCancel)
                {
                    let navigationCancelEvent = event as NavigationCancel;
                    this.logger.info(
                        "Angular hat die Navigation abgebrochen. (Navigationsurl: {url}; Grund: {reason})", 
                        navigationCancelEvent.url, 
                        navigationCancelEvent.reason);
                }
                else if  (event instanceof NavigationError)
                {
                    let navigationErrorEvent = event as NavigationError;
                    this.logger.error(
                        navigationErrorEvent.error, 
                        "Angular hat beim Navigieren einen Fehler festgestellt. (Navigationsurl: {url})", 
                        navigationErrorEvent.url);
                }
                else if  (event instanceof RoutesRecognized)
                {
                    let navigationRoutesRecognizedEvent = event as RoutesRecognized;
                    this.logger.info(
                        "Angular hat die Router der Navigation verarbeitet. (Navigationsurl: {url}; UrlAfterRedirects: {urlAfterRedirects}; State: {state})", 
                        navigationRoutesRecognizedEvent.url, 
                        navigationRoutesRecognizedEvent.urlAfterRedirects, 
                        navigationRoutesRecognizedEvent.state);
                }
            }
        );
    }
    // #endregion
}