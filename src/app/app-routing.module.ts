import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { MenuComponent } from './menu/menu.component';
import { RunTimeComponent } from './run-time/run-time.component';

const routes: Routes = [
  { path: 'home', component: DashboardComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'run-time', component: RunTimeComponent },
  { path: '**', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
