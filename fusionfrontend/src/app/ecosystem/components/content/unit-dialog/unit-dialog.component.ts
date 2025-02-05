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

import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Unit } from 'src/app/core/store/unit/unit.model';
import { Observable } from 'rxjs';
import { QuantityType } from '../../../../core/store/quantity-type/quantity-type.model';
import { QuantityTypeQuery } from '../../../../core/store/quantity-type/quantity-type.query';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import { WizardHelper } from '../../../../core/helpers/wizard-helper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-unit-dialog',
  templateUrl: './unit-dialog.component.html',
  styleUrls: ['./unit-dialog.component.scss']
})
export class UnitDialogComponent implements OnInit {

  unit: Unit;
  unitForm: FormGroup;
  quantityTypes$: Observable<QuantityType[]>;
  type: DialogType;

  public DialogType = DialogType;
  public isQuantityTypeLocked: boolean;

  constructor(private quantityQuery: QuantityTypeQuery,
              public dialogRef: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private formBuilder: FormBuilder,
              public translate: TranslateService) {
  }

  ngOnInit() {
    this.quantityTypes$ = this.quantityQuery.selectAll();
    this.unit = this.config.data?.unit;
    this.type = this.config.data?.type;
    this.isQuantityTypeLocked = this.config.data.prefilledQuantityTypeId != null;
    this.unitForm = this.createDialogFormGroup(this.unit);
  }

  createDialogFormGroup(unit: Unit): FormGroup {
    const unitGroup = this.formBuilder.group({
      id: [],
      version: [],
      name: [null, WizardHelper.requiredTextValidator],
      label: [null, WizardHelper.maxTextLengthValidator],
      symbol: [null, WizardHelper.maxTextLengthValidator],
      quantityTypeId: [null, Validators.required],
    });

    if (unit) {
      unitGroup.patchValue(unit);
      unitGroup.get('quantityTypeId').patchValue(unit.quantityType?.id);
    }
    if (this.isQuantityTypeLocked) {
      unitGroup.get('quantityTypeId').patchValue(this.config.data.prefilledQuantityTypeId);
    }
    return unitGroup;
  }

  dismissModal(): void {
    this.dialogRef.close();
  }

  confirmModal(): void {
    const unit = this.unitForm.getRawValue() as Unit;
    this.dialogRef.close(unit);
  }

}
