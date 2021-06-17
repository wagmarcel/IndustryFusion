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
import { AssetSeriesDetailsQuery } from '../../../../store/asset-series-details/asset-series-details-query.service';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { tap } from 'rxjs/operators';
import { AssetSeriesDetailsResolver } from '../../../../resolvers/asset-series-details-resolver.service';
import { AssetSeriesService } from '../../../../store/asset-series/asset-series.service';
import { AssetSeriesStore } from '../../../../store/asset-series/asset-series.store';
import { CompanyStore } from '../../../../store/company/company.store';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetSeriesCreateComponent } from '../asset-series-create/asset-series-create.component';
import { CompanyQuery } from '../../../../store/company/company.query';
import { AssetTypeTemplatesResolver } from '../../../../resolvers/asset-type-templates.resolver';
import { UnitsResolver } from '../../../../resolvers/units.resolver';
import { AssetSeries } from '../../../../store/asset-series/asset-series.model';
import { AssetWizardComponent } from '../asset-wizard/asset-wizard.component';
import { AssetWizardStep } from '../asset-wizard/asset-wizard-step/asset-wizard-step.model';

@Component({
  selector: 'app-asset-series-list',
  templateUrl: './asset-series-list.component.html',
  styleUrls: ['./asset-series-list.component.scss']
})
export class AssetSeriesListComponent implements OnInit, OnDestroy {

  titleMapping:
    { [k: string]: string } = { '=0': 'No asset series.', '=1': '# Asset series', other: '# Asset series' };

  editBarMapping:
    { [k: string]: string } = {
    '=0': 'No asset series templates selected',
    '=1': '# Asset series template selected',
    other: '# Asset series templates selected'
  };


  isLoading$: Observable<boolean>;
  sortField: string;
  items$: Observable<any[]>;
  selected: Set<ID> = new Set();
  error: any;
  shouldShowCreateItem = false;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public companyStore: CompanyStore,
    public companyQuery: CompanyQuery,
    public assetSeriesService: AssetSeriesService,
    public assetSeriesDetailsQuery: AssetSeriesDetailsQuery,
    public assetSeriesStore: AssetSeriesStore,
    public assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    public  assetTypeTemplatesResolver: AssetTypeTemplatesResolver,
    public unitsResolver: UnitsResolver,
    public dialogService: DialogService) {
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.assetSeriesDetailsResolver.resolve(this.route.snapshot);
    this.items$ = this.assetSeriesDetailsQuery.selectAll();
    this.assetTypeTemplatesResolver.resolve().subscribe();
    this.unitsResolver.resolve().subscribe();
    this.assetSeriesDetailsQuery.selectError().pipe(tap((error) => {
      if (error) {
        this.error = error;
      }
    })).subscribe();
  }

  ngOnDestroy() {
    this.assetSeriesDetailsQuery.resetError();
  }

  createItem() {
    this.startAssetSeriesWizard('');
  }

  createAsset($event: ID) {
    this.startAssetWizard($event);
  }

  onSort(field: string) {
    this.sortField = field;
  }

  onItemSelect(id: ID) {
    this.selected.add(id);
  }

  onItemDeselect(id: ID) {
    this.selected.delete(id);
  }

  deleteItems() {
    this.selected.forEach(id => {
          this.deleteItem(id);
    });
  }

  deleteItem(id: number | string) {
    this.assetSeriesService.deleteItem(this.route.snapshot.params.companyId, id).subscribe(
      () => this.selected.clear()
    );
  }

  deselectAllItems() {
    this.selected.clear();
  }

  isSelected(id: ID) {
    return this.selected.has(id);
  }

  getErrorMessage() {
    if (this.error) {
      return this.error.error.message;
    }
    return undefined;
  }

  onCloseError() {
    this.error = undefined;
  }

  onDismissModal() { this.shouldShowCreateItem = false; }

  modifyItems() {
    if (this.selected.size === 1) {
      const itemId: ID = Array.from(this.selected)[0];
      this.modifyItem(itemId);
    }
  }

  modifyItem(itemId: number | string) {
    this.startAssetSeriesWizard(itemId.toString(), 2);
  }

  public startAssetSeriesWizard(idString: string, startStep: number = 1) {
    const dialogRef = this.dialogService.open(AssetSeriesCreateComponent, {
      data: {
        companyId: this.companyQuery.getActiveId(),
        assetSeriesId: idString,
        step: startStep
      },
      width: '75%'
    });

    dialogRef.onClose.subscribe((value: AssetSeries) => {
      if (value) {
        this.updateAssetSeries(value);
      }
    });
  }

  public startAssetWizard(assetSeriesId: ID, startStep: AssetWizardStep = AssetWizardStep.START) {
    const dialogRef = this.dialogService.open(AssetWizardComponent, {
      data: {
        companyId: this.companyQuery.getActiveId(),
        prefilledAssetSeriesId: assetSeriesId,
        step: startStep
      },
      width: '75%'
    });

    dialogRef.onClose.subscribe((value: AssetSeries) => {
      if (value) {
        this.updateAssetSeries(value);
      }
    });
  }

  updateAssetSeries(assetSeries: AssetSeries) {
    if (assetSeries.id) {
      this.assetSeriesService.editItem(assetSeries.id, assetSeries)
        .subscribe(newAssetSeries => assetSeries = newAssetSeries);
    } else {
      this.assetSeriesService.createItem(assetSeries.companyId, assetSeries.assetTypeTemplateId)
        .subscribe(newAssetSeries => assetSeries = newAssetSeries);
    }
  }
}
