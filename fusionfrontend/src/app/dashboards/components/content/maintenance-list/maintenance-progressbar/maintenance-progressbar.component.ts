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


import { Component, Input, OnInit } from '@angular/core';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';
import { MaintenanceState } from '../maintenance-list.component';

@Component({
  selector: 'app-maintenance-progressbar',
  templateUrl: './maintenance-progressbar.component.html',
  styleUrls: ['./maintenance-progressbar.component.scss']
})
export class MaintenanceProgressbarComponent implements OnInit {

  @Input()
  asset: FactoryAssetDetailsWithFields;

  @Input()
  maintenanceValue: number;

  @Input()
  maintenancePercentage: number;

  @Input()
  state: MaintenanceState;

  maintenanceState = MaintenanceState;

  constructor() {
  }

  ngOnInit(): void {
  }

}
