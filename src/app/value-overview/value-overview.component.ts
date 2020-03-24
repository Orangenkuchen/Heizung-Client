import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/DataService/data.service';

@Component({
  selector: 'app-value-overview',
  templateUrl: './value-overview.component.html',
  styleUrls: ['./value-overview.component.less']
})
export class ValueOverviewComponent implements OnInit {

  constructor(public dataService: DataService) { }

  ngOnInit() {
  }

}
