/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { OispDeviceStatus } from '../../../../core/models/kairos.model';
import { UIChart } from 'primeng/chart';
import { EnumHelpers } from '../../../../core/helpers/enum-helpers';
import { StatusHoursOneDay } from '../../../../core/models/kairos-status-aggregation.model';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-equipment-efficiency-bar-chart',
  templateUrl: './equipment-efficiency-bar-chart.component.html',
  styleUrls: ['./equipment-efficiency-bar-chart.component.scss']
})
export class EquipmentEfficiencyBarChartComponent implements OnInit, OnChanges {

  @Input()
  assetStatusHoursOfDays: StatusHoursOneDay[];

  @Input()
  showAxes = false;

  @Input()
  yLabels: string[];

  @Input()
  maxXAxisValue: number;

  @ViewChild('chart') chart: UIChart;

  stackedOptions: any;
  stackedData: any;

  private numDisplayedDays: number;
  private isInitialized = false;

  constructor(
    private enumHelpers: EnumHelpers,
    private translate: TranslateService) {
  }

  private static getDatasetIndexOfStatus(status: OispDeviceStatus): 0 | 1 | 2 | 3 {
    switch (status) {
      case OispDeviceStatus.OFFLINE:
        return 0;
      case OispDeviceStatus.ERROR:
        return 1;
      case OispDeviceStatus.IDLE:
        return 2;
      case OispDeviceStatus.RUNNING:
        return 3;
    }
  }

  public static getHoursString(hoursWithMinutes: number): string {
      const hours: string = hoursWithMinutes > 99 ? '' + Math.floor(hoursWithMinutes) : ('00' + Math.floor(hoursWithMinutes)).slice(-2);
      const minutes: string = ('00' + Math.round((hoursWithMinutes - Math.floor(hoursWithMinutes)) * 60)).slice(-2);
      return minutes === '60' ? `${('00' + Math.floor(hoursWithMinutes + 1)).slice(-2)}:00 h` : `${hours}:${minutes} h`;
  }

  ngOnInit(): void {
    this.numDisplayedDays = this.assetStatusHoursOfDays.length;
    this.initChartOptions();
    this.initChartData();
    this.initCanvasHeight();
    this.isInitialized = true;

    this.updateChart(this.assetStatusHoursOfDays);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isInitialized) {
      if (changes.assetStatusHoursOfDays) {
        this.updateChart(changes.assetStatusHoursOfDays.currentValue);
      }
      if (changes.showAxes) {
        this.initCanvasHeight();
      }
    }
  }

  private initChartOptions() {
    const axesOptions = this.getAxesOptions();

    const tooltips = {
      mode: this.numDisplayedDays === 1 ? 'dataset' : 'point',
      position: 'nearest',
      callbacks: {
        title(tooltipItem, data) {
          const value = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index];
          const label = data.datasets[tooltipItem[0].datasetIndex].label;
          return EquipmentEfficiencyBarChartComponent.getHoursString(value) + ' (' + label + ')';
        },
        label(_, _2) {
          return '';
        },
      },
      backgroundColor: '#000000',
      titleFontSize: 16,
      titleFontColor: '#FFFFFF',
      bodyFontColor: '#FFFFFF',
      bodyFontSize: 12,
      displayColors: false,
      xAlign: 'center',
    };

    this.stackedOptions = {
      tooltips,
      animation: false,
      maintainAspectRatio: false,
      responsive: true,
      layout: {
        padding: {
          bottom: 22,
          right: 50
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: axesOptions,
        yAxes: axesOptions
      }
    };
  }

  private getAxesOptions() {
    if (this.showAxes) {
      return [{
        stacked: true,
        display: true,
        ticks: {
          beginAtZero: true,
          fontSize: 14,
          stepSize: 2,
          max: this.maxXAxisValue ?? undefined,
          fontFamily: '\'Metropolis\', \'Avenir Next\', \'Helvetica\', serif'
        },
        gridLines: {
          display: true,
          drawOnChartArea: false
        },
      }];
    } else {
      return [{
        stacked: true,
        display: false,
        ticks: {
          beginAtZero: false
        },
        gridLines: {
          display: false
        }
      }];
    }
  }

  private initChartData() {
    let emptyLabels: string[] = [];
    emptyLabels = this.fillArrayForDays(emptyLabels, '');

    if (this.yLabels && this.numDisplayedDays !== this.yLabels.length) {
      console.warn('[equipment efficiency bar chart]: There are more labels than existing datasets');
    }

    this.stackedData = {
      labels: this.yLabels ?? emptyLabels,
      datasets: [{
        type: 'horizontalBar',
        label: this.translate.instant('APP.COMMON.STATUSES.OFFLINE'),
        backgroundColor: '#EAEAEA',
      }, {
        type: 'horizontalBar',
        label: this.translate.instant('APP.COMMON.STATUSES.ERROR'),
        backgroundColor: '#A73737',
      }, {
        type: 'horizontalBar',
        label: this.translate.instant('APP.COMMON.STATUSES.IDLE'),
        backgroundColor: '#454F63',
      },
        {
          type: 'horizontalBar',
          label: this.translate.instant('APP.COMMON.STATUSES.RUNNING'),
          backgroundColor: '#2CA9CE',
        }]
    };
  }

  private fillArrayForDays(array: any[], content: any): any[] {
    for (let i = 0; i < this.numDisplayedDays; i++) {
      array.push(content);
    }
    return array;
  }

  private initCanvasHeight() {
    const canvasHeight = this.numDisplayedDays * 3 + (this.showAxes ? 0.5 : 0);
    document.documentElement.style.setProperty('--canvas-height', `${ canvasHeight }rem`);
  }

  private updateChart(assetStatusHoursOfDays: StatusHoursOneDay[]) {
    this.resetChartData();
    this.setChartData(assetStatusHoursOfDays);
    this.chart?.reinit();
  }

  private resetChartData() {
    for (let i = 0; i < this.enumHelpers.getIterableArray(OispDeviceStatus).length; i++) {
      this.stackedData.datasets[i].data = [];
      this.stackedData.datasets[i].data = this.fillArrayForDays(this.stackedData.datasets[i].data, 0);
    }
  }

  private setChartData(assetStatusHoursOfDays: StatusHoursOneDay[]) {
    if (assetStatusHoursOfDays) {
      for (let dayIndex = 0; dayIndex < assetStatusHoursOfDays.length; dayIndex++) {
        assetStatusHoursOfDays[dayIndex].statusHours.forEach(statusHour => {
          const index = EquipmentEfficiencyBarChartComponent.getDatasetIndexOfStatus(statusHour.status);
          this.stackedData.datasets[index].data[dayIndex] = statusHour.hours;
        });
      }
    }
  }
}
