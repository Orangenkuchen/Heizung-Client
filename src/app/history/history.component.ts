import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/DataService/data.service';
import * as Highcharts from 'highcharts';
import * as Moment from 'moment-timezone';
import { HeaterDataType } from '../entities/HeaterDataType';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.less']
})
export class HistoryComponent implements OnInit, OnDestroy {

    // #region fields
    /**
     * Dieser Array enthält unsubscribe Funktionen
     */
    private unsubscribeArray = Array<() => void>();
    // #endregion

    constructor(private dataService: DataService) { }

    ngOnInit() {
        window["moment"] = Moment;

        let that = this;
        this.refreshHighchartData(that);

        let unsubscribe = this.dataService.addOnDataChangeCallback(() => this.refreshHighchartData(that));
        this.unsubscribeArray.push(unsubscribe);
    }

    ngOnDestroy() {
        this.unsubscribeArray.forEach((unsubscribe) => unsubscribe());
    }

    // #region config
    /**
     * Die Konfiguration für das Highchart
     */
    public options: any = {
        chart: {
          type: 'line',
          height: 700
        },
        title: {
          text: 'Heizungswerte'
        },
        credits: {
          enabled: true
        },
        tooltip: {
          formatter: function() {
            return `${Math.round(this.y.toFixed(2) * 10) / 10} °C ${Highcharts.dateFormat('%e %b %y %H:%M:%S', this.x)}`;
          }
        },
        xAxis: {
          type: 'datetime',
          labels: {
            formatter: function() {
              return Highcharts.dateFormat('%e %b %y', this.value);
            }
          }
        },
        yAxis: {
          title: {
            text: '°C'
          }
        },
        series: [
          {
            name: 'Abgastemperatur',
            turboThreshold: 500000,
            data: []
          },
          {
            name: 'Puffer oben',
            turboThreshold: 500000,
            data: []
          },
          {
            name: 'Puffer unten',
            turboThreshold: 500000,
            data: []
          },
          {
            name: 'Außentemperatur',
            turboThreshold: 500000,
            data: []
          },
        ],
        plotOptions: {
            series: {
                gapSize: 5,
                gapUnit: 30 * 60 * 1000
            }
        },
    }
    // #endregion

    // #region refreshHighchartData
    /**
     * Aktualisiert die Daten für die angezeigten Highchart-Axen
     */
    private refreshHighchartData(that: any) {
        this.convertDataAndAddToHighchrtSeries(that, that.data[HeaterDataType.Abgastemperatur].data, 0);
        this.convertDataAndAddToHighchrtSeries(that, that.data[HeaterDataType.Puffer_oben].data, 1);
        this.convertDataAndAddToHighchrtSeries(that, that.data[HeaterDataType.Puffer_unten].data, 2);
        this.convertDataAndAddToHighchrtSeries(that, that.data[HeaterDataType.Aussentemperatur].data, 3);
    }
    // #endregion

    // #region convertDataAndAddToHighchrtSeries
    /**
     * Wandelt die rohen Daten um und fügt sie in die Highchart-Serie ein
     * 
     * @param that Das This vom Parent
     * @param dataArray Der Array mit den Daten
     * @param seriesIndex Der Index von der Datenserie, in welche die Daten eingefügt werden sollen
     */
    private convertDataAndAddToHighchrtSeries(that: any, dataArray: Array<any>, seriesIndex: number): void {
        if (that.options.series.length > seriesIndex - 1) {
            let series = that.options.series[seriesIndex];
            series.length = 0;

            dataArray.forEach((dataPoint) => {
                let highChartPoint = [];

                highChartPoint.push(dataPoint.timestamp.getTime());
                highChartPoint.push(dataPoint.value);

                series.data.push(highChartPoint);
            });
        }
    }
    // #endregion
}
