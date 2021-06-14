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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Observable } from 'rxjs';

import { Field } from '../../../../store/field/field.model';
import { FieldTarget } from '../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../store/field/field-query.service';
import { FieldType } from '../../../../store/field-details/field-details.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-asset-type-template-create-step-three',
  templateUrl: './asset-type-template-create-step-three.component.html',
  styleUrls: ['./asset-type-template-create-step-three.component.scss']
})
export class AssetTypeTemplateCreateStepThreeComponent implements OnInit {

  @Input() assetTypeTemplateForm: FormGroup;
  @Input() inputAttributes: Array<FieldTarget>;
  @Output() stepChange = new EventEmitter<number>();
  @Output() attributeSelect = new EventEmitter<FieldTarget[]>();

  shouldAddAttribute = false;
  fields: Observable<Field[]>;
  confirmedAttributes: Array<FieldTarget> = [];
  selectedAttributes: Array<FieldTarget> = [];

  constructor(private fieldQuery: FieldQuery) { }

  ngOnInit() {
    this.fields = this.fieldQuery.selectAll();

    if (this.inputAttributes) {
      this.selectedAttributes = this.selectedAttributes.concat(this.inputAttributes);
      this.confirmedAttributes = this.confirmedAttributes.concat(this.inputAttributes);
    }
  }

  isConfirmed(metric: FieldTarget): boolean {
    return this.confirmedAttributes.indexOf(metric) !== -1;
  }

  private changeStep(step: number) {
    if (this.confirmedAttributes.length === this.selectedAttributes.length  && this.assetTypeTemplateForm?.valid) {
      this.attributeSelect.emit(this.confirmedAttributes);
      this.stepChange.emit(step);
    }
  }

  prevStep() {
    this.changeStep(2);
  }

  nextStep() {
    this.changeStep(4);
  }

  addAttribute() {
    this.shouldAddAttribute = true;
  }

  onChangeAttribute(field: Field) {
    const fieldTarget = new FieldTarget();
    fieldTarget.fieldType = FieldType.ATTRIBUTE;
    fieldTarget.field = field;
    fieldTarget.fieldId = field.id;
    fieldTarget.mandatory = false;
    this.selectedAttributes.push(fieldTarget);
    this.shouldAddAttribute = false;
    this.assetTypeTemplateForm.get('metric').setValue(undefined);
  }

  onConfirm(fieldTarget: FieldTarget) {
    this.confirmedAttributes.push(fieldTarget);
  }

  onEdit(fieldTarget: FieldTarget) {
    const index  = this.confirmedAttributes.indexOf(fieldTarget);
    if (index > -1) {
      this.confirmedAttributes.splice(index, 1);
    }
  }

  onDelete(fieldTarget: FieldTarget) {
    const index  = this.confirmedAttributes.indexOf(fieldTarget);
    if (index > -1) {
      this.confirmedAttributes.splice(index, 1);
    }

    const index1 = this.selectedAttributes.indexOf(fieldTarget);
    if (index1 > -1) {
      this.selectedAttributes.splice(index1, 1);
    }
  }
}
