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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListComponent } from '../base/base-list/base-list.component';
import { FieldQuery } from '../../../../store/field/field.query';
import { FieldService } from '../../../../store/field/field.service';
import { FieldDialogComponent } from '../field-dialog/field-dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.scss'],
})
export class FieldListComponent extends BaseListComponent implements OnInit, OnDestroy {

  public titleMapping:
  { [k: string]: string} = { '=0': 'No Metrics & Attributes', '=1': '# Metric & Attribute', other: '# Metrics & Attributes' };

  public editBarMapping:
    { [k: string]: string } = {
      '=0': 'No metrics & attributes selected',
      '=1': '# metric or attribute selected',
      other: '# metrics or attributes selected'
    };
  private createDialogRef: DynamicDialogRef;


  constructor(public route: ActivatedRoute,
              public router: Router,
              public fieldQuery: FieldQuery,
              public fieldService: FieldService,
              private dialogService: DialogService) {
    super(route, router, fieldQuery, fieldService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.fieldQuery.resetError();
    this.createDialogRef?.close();
  }

  showCreateDialog() {
    this.createDialogRef = this.dialogService.open(FieldDialogComponent, {
      data: { },
      header: 'Create new Metric or Attribute',
    });
  }
}
