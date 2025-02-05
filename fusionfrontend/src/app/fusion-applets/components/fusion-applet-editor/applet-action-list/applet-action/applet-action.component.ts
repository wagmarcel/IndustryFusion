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
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {  RuleActionType } from 'src/app/core/store/oisp/oisp-rule/oisp-rule.model';

@Component({
  selector: 'app-applet-action',
  templateUrl: './applet-action.component.html',
  styleUrls: ['./applet-action.component.scss']
})
export class AppletActionComponent implements OnInit {
  RuleActionType = RuleActionType;

  @Input()
  actionGroup: FormGroup;


  constructor() {
  }

  ngOnInit(): void {
    if ((this.actionGroup.get('target') as FormArray).length === 0) {
      (this.actionGroup.get('target') as FormArray).push(
        new FormControl(null, [Validators.required, Validators.minLength(1)])
      );
    }
  }

  showActionTypePanel(type: RuleActionType): boolean {
    const actualType = this.actionGroup.get('type').value;
    return !actualType || actualType === type;
  }

  isActionType(type: RuleActionType): boolean {
    const actualType = this.actionGroup.get('type').value;
    return actualType === type;
  }

  setActionType(type: RuleActionType) {
    if (!this.actionGroup.get('type').value) {
      this.actionGroup.get('type').setValue(type);
    }
  }

}
