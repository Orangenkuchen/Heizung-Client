import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/DataService/data.service';

@Component({
  selector: 'app-run-time',
  templateUrl: './run-time.component.html',
  styleUrls: ['./run-time.component.less']
})
export class RunTimeComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }

}
