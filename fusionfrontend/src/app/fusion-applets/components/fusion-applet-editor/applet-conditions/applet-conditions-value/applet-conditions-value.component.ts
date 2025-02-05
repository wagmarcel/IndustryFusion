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
import {
  ConditionType,
  ConditionValue, ConditionValueComponent,
  ConditionValueOperator,
  displayConditionType
} from 'src/app/core/store/oisp/oisp-rule/oisp-rule.model';
import { SelectItem } from 'primeng/api';
import { EnumHelpers } from '../../../../../core/helpers/enum-helpers';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Device, DeviceComponent } from '../../../../../core/store/oisp/oisp-device/oisp-device.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-applet-conditions-value',
  templateUrl: './applet-conditions-value.component.html',
  styleUrls: ['./applet-conditions-value.component.scss']
})
export class AppletConditionsValueComponent implements OnInit {
  ConditionType = ConditionType;
  activeAccordionIndex = -1;

  @Input()
  conditionValueGroup: FormGroup;

  @Input()
  devices: Device[] = [];
  selectedDevices: Device[] = [];

  conditionTypeDropdownValue: SelectItem[];
  conditionOperatorDropdownValue: SelectItem[];

  constructor(private enumHelpers: EnumHelpers,
              private translate: TranslateService) {
    this.setupDropdowns();
  }

  ngOnInit(): void {
    this.prefillSelectedDevices();
  }

  private prefillSelectedDevices() {
    const conditionValue: ConditionValue = this.conditionValueGroup.getRawValue();
    if (conditionValue.component?.cid && this.devices) {
      const selectedDevice = this.devices.find(device =>
        device.components.find(deviceComponent => deviceComponent.cid === conditionValue.component.cid)
      );
      this.selectedDevices = [];
      if (selectedDevice) {
        this.selectedDevices.push(selectedDevice);
      }
    }
  }

  private setupDropdowns() {
    this.conditionTypeDropdownValue = this.getConditionTypeDropdownValue();
    this.conditionOperatorDropdownValue = this.getConditionOperatorDropdownValue();
  }

  getConditionTypeDropdownValue(): SelectItem[] {
    const result = [];

    for (const element of this.enumHelpers.getIterableArray(ConditionType)) {
      displayConditionType(element, this.translate).subscribe(label => {
          result.push({
            label,
            value: element
          });
        });
    }
    return result;
  }

  getConditionOperatorDropdownValue(): SelectItem[] {
    const result = [];

    for (const element of this.enumHelpers.getIterableArray(ConditionValueOperator)) {
      result.push({
        label: element,
        value: element
      });
    }
    return result;
  }

  updateComponent(component: ConditionValueComponent) {
    this.conditionValueGroup.get('component').patchValue(component);
  }

  mapDevicesToComponents(devices: Device[]): SelectItem<ConditionValueComponent>[] {
    const cid = this.conditionValueGroup.get('component.cid')?.value;
    const components: SelectItem<ConditionValueComponent>[] = devices
      .map(device => device.components
        .map<SelectItem<ConditionValueComponent>>(component => {
          return this.mapDeviceComponentToSelectItem(device, component);
        }))
      .reduce((acc, val) => acc.concat(val), []);

    if (cid) {
      const deviceComponent = this.devices
        .map(device => ({ device, component: device.components.find(component => component.cid === cid)}))
        .find(component => component);
      if (deviceComponent && components.find(selectItem => selectItem.value.cid === cid) === undefined) {
        components.push(this.mapDeviceComponentToSelectItem(deviceComponent.device, deviceComponent.component));
      }
    }
    return components.filter(selectedItem => selectedItem);
  }

  private mapDeviceComponentToSelectItem(device: Device, component: DeviceComponent): SelectItem<ConditionValueComponent> {
    if (!device || !component) {
      return null;
    }
    return {
      label: device.name + ': ' + component.name + '(' + component.componentType?.dataType + ')',
      value: {
        name: component.name,
        dataType: component.componentType?.dataType,
        cid: component.cid
      }
    };
  }

  close() {
    this.activeAccordionIndex = -1;
  }

  isAnyConditionType(types: ConditionType[]): boolean {
    let result = false;
    for (const type of types) {
      result = result || this.conditionValueGroup.get('type').value === type;
    }
    return result;
  }

  getAsFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  getAsFormArray(control: AbstractControl): FormArray {
    return control as FormArray;
  }
}
