import { Component, OnInit } from '@angular/core';
import { CurrentDataService } from 'src/app/services/CurrentDataService/current-data.service';

@Component({
  selector: 'app-value-overview',
  templateUrl: './value-overview.component.html',
  styleUrls: ['./value-overview.component.less']
})
export class ValueOverviewComponent implements OnInit {

  constructor(public currentDataService: CurrentDataService) { }

  ngOnInit() {
  }

}
