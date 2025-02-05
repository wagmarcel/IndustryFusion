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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AssetTypeTemplateQuery } from '../../../../../core/store/asset-type-template/asset-type-template.query';
import { AssetTypeTemplateService } from '../../../../../core/store/asset-type-template/asset-type-template.service';
import {
  AssetTypeTemplate,
  PublicationState
} from '../../../../../core/store/asset-type-template/asset-type-template.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { AssetTypeTemplateWizardMainComponent } from '../asset-type-template-wizard/asset-type-template-wizard-main/asset-type-template-wizard-main.component';
import { ID } from '@datorama/akita';
import { DialogType } from '../../../../../shared/models/dialog-type.model';
import { AssetTypeTemplateDialogUpdateComponent } from '../asset-type-template-dialog/asset-type-template-update-dialog/asset-type-template-dialog-update.component';
import { ItemOptionsMenuType } from '../../../../../shared/components/ui/item-options-menu/item-options-menu.type';
import { ConfirmationService } from 'primeng/api';
import { FilterOption, FilterType } from '../../../../../shared/components/ui/table-filter/filter-options';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TableHelper } from '../../../../../core/helpers/table-helper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-asset-type-template-list',
  templateUrl: './asset-type-template-list.component.html',
  styleUrls: ['./asset-type-template-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class AssetTypeTemplateListComponent implements OnInit, OnDestroy {

  @Input() assetTypeTemplates$: Observable<AssetTypeTemplate[]>;
  @Input() parentAssetTypeId: ID | null;

  titleMapping: { [k: string]: string } = {
    '=0': this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.NO_ASSET_TYPE_TEMPLATES'),
    '=1': '# ' + this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.ASSET_TYPE_TEMPLATE'),
    other: '# ' + this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.ASSET_TYPE_TEMPLATES')
  };

  menuType: ItemOptionsMenuType[];
  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  assetTypeTemplates: AssetTypeTemplate[];
  displayedAssetTypeTemplates: AssetTypeTemplate[];
  filteredAssetTypeTemplates: AssetTypeTemplate[];
  searchedAssetTypeTemplates: AssetTypeTemplate[];

  activeListItem: AssetTypeTemplate;

  tableFilters: FilterOption[] = [
    { filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.VERSION'),
      attributeToBeFiltered: 'publishedVersion' },
    { filterType: FilterType.DATEFILTER, columnName: this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.PUBLISH_DATE'),
      attributeToBeFiltered: 'publishedDate' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.STATUS'),
      attributeToBeFiltered: 'publicationState' }
  ];


  private createWizardRef: DynamicDialogRef;
  private updateWizardRef: DynamicDialogRef;
  private warningDialogRef: DynamicDialogRef;


  constructor(
    private assetTypeTemplateQuery: AssetTypeTemplateQuery,
    private assetTypeTemplateService: AssetTypeTemplateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService) {
     }

  ngOnInit() {
    this.menuType = [ItemOptionsMenuType.DELETE];
    if (this.assetTypeTemplates$ == null) {
      this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll();
    }
    this.assetTypeTemplates$.subscribe(assetTypeTemplates => {
      this.displayedAssetTypeTemplates = this.filteredAssetTypeTemplates = this.searchedAssetTypeTemplates =
        this.assetTypeTemplates = assetTypeTemplates;
    });

    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
  }

  setActiveRow(assetTypeTemplate?: AssetTypeTemplate): void {
    if (assetTypeTemplate) {
      this.activeListItem = assetTypeTemplate;
      this.menuType = assetTypeTemplate.publicationState === PublicationState.PUBLISHED ?
        [ItemOptionsMenuType.DELETE] : [ItemOptionsMenuType.UPDATE, ItemOptionsMenuType.DELETE];
    }
  }

  searchAssetTypeTemplates(event: AssetTypeTemplate[]): void {
    this.searchedAssetTypeTemplates = event;
    this.updateAssetTypeTemplates();
  }

  filterAssetTypeTemplates(event: AssetTypeTemplate[]) {
    this.filteredAssetTypeTemplates = event;
    this.updateAssetTypeTemplates();
  }

  private updateAssetTypeTemplates(): void {
    this.displayedAssetTypeTemplates = this.assetTypeTemplates;
    if (this.searchedAssetTypeTemplates) {
      this.displayedAssetTypeTemplates = this.filteredAssetTypeTemplates.filter(assetType =>
        this.searchedAssetTypeTemplates.includes(assetType));
    }
  }

  onCreate() {
    this.createWizardRef = this.dialogService.open(AssetTypeTemplateWizardMainComponent, {
      data: {
        type: DialogType.CREATE,
        preselectedAssetTypeId: this.parentAssetTypeId
      },
      header: this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.DIALOG_HEADER'),
      width: '90%'
    });
  }

  ngOnDestroy() {
    if (this.createWizardRef) {
      this.createWizardRef.close();
    }
    this.assetTypeTemplateQuery.resetError();
  }

  onUpdate() {
    this.warningDialogRef = this.dialogService.open(AssetTypeTemplateDialogUpdateComponent, { width: '60%' } );
    this.warningDialogRef.onClose.subscribe((callUpdateWizard: boolean) => {
      if (callUpdateWizard) {
        this.showUpdateWizard();
      }
    });
  }

  private showUpdateWizard() {
    this.updateWizardRef = this.dialogService.open(AssetTypeTemplateWizardMainComponent,
      {
        data: { assetTypeTemplate: this.activeListItem, type: DialogType.EDIT },
        header: this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.DIALOG_HEADER'),
        width: '70%',
      }
    );
    this.updateWizardRef.onClose.subscribe((assetTypeTemplateForm: FormGroup) =>
      this.onCloseUpdateWizard(assetTypeTemplateForm));
  }

  private onCloseUpdateWizard(assetTypeTemplateForm: FormGroup) {
    if (assetTypeTemplateForm && assetTypeTemplateForm.get('wasPublished')?.value) {
      this.activeListItem.publicationState = assetTypeTemplateForm.get('publicationState')?.value;
      this.activeListItem.publishedDate = assetTypeTemplateForm.get('publishedDate')?.value;
      this.activeListItem.publishedVersion = assetTypeTemplateForm.get('publishedVersion')?.value;
      this.menuType = [ItemOptionsMenuType.DELETE];
      this.assetTypeTemplateService.editItem(this.activeListItem.id, this.activeListItem).subscribe();
    }
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.CONFIRMATION_DIALOG.MESSAGE',
        { itemToDelete: this.activeListItem.name }),
      header: this.translate.instant('APP.ECOSYSTEM.ASSET_TYPE_TEMPLATE.LIST.CONFIRMATION_DIALOG.HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteAssetTypeTemplate();
      },
      reject: () => {
      }
    });
  }

  deleteAssetTypeTemplate() {
  }

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }
}
