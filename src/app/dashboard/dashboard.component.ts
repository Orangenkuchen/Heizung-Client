import { Component, OnInit, ɵisBoundToModule__POST_R3__, ViewEncapsulation } from '@angular/core';
import { SocketService } from '../services/SocketService/socket.service';
import { Subject } from 'rxjs';
import * as Moment from 'moment-timezone';
import { DataService } from '../services/DataService/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  encapsulation : ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
    constructor(private socketService: SocketService, public dataService: DataService) { }

    ngOnInit(): void {
        this.dataService.currentExhaustTemperature.value;
    }

    public temperatureToString = (number) => { return number + "°C"; };
}