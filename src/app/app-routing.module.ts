import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { MenuComponent } from './menu/menu.component';
import { RunTimeComponent } from './run-time/run-time.component';
import { ValueOverviewComponent }  from './value-overview/value-overview.component';
import { MailNotifierSettingsComponent } from './mail-notifier-settings/mail-notifier-settings.component';

const routes: Routes = [
  { path: 'home', component: DashboardComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'run-time', component: RunTimeComponent },
  { path: 'mail-notification', component: MailNotifierSettingsComponent},
  { path: 'value-overview', component: ValueOverviewComponent },
  { path: '**', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
