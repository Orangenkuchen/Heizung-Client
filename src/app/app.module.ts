import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GaugeModule } from 'angular-gauge';
import { HistoryComponent } from './history/history.component';
import { MenuComponent } from './menu/menu.component';
import { RunTimeComponent } from './run-time/run-time.component';
import { MailNotifierSettingsComponent } from './mail-notifier-settings/mail-notifier-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HistoryComponent,
    MenuComponent,
    RunTimeComponent,
    MailNotifierSettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GaugeModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }