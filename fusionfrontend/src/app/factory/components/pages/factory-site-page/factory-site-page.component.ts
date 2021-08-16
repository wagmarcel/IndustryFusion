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
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { Asset } from 'src/app/store/asset/asset.model';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { Company } from 'src/app/store/company/company.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/store/factory-site/factory-site.query';
import { Room } from 'src/app/store/room/room.model';
import { FactoryAssetDetails, FactoryAssetDetailsWithFields } from '../../../../store/factory-asset-details/factory-asset-details.model';
import { CompanyQuery } from '../../../../store/company/company.query';
import { AssetService } from '../../../../store/asset/asset.service';
import { RoomService } from '../../../../store/room/room.service';

@Component({
  selector: 'app-factory-site-page',
  templateUrl: './factory-site-page.component.html',
  styleUrls: ['./factory-site-page.component.scss']
})
export class FactorySitePageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  factorySites$: Observable<FactorySite[]>;
  factorySite$: Observable<FactorySite>;
  rooms$: Observable<Room[]>;
  allRoomsOfFactorySite$: Observable<Room[]>;
  assets$: Observable<Asset[]>;
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;
  selectedIds: ID[];
  companyId: ID;
  createdAssetDetailsId: ID;

  constructor(
    private companyQuery: CompanyQuery,
    private factorySiteQuery: FactorySiteQuery,
    private assetQuery: AssetQuery,
    private assetService: AssetService,
    private factoryResolver: FactoryResolver,
    private roomService: RoomService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading$ = this.factorySiteQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.company$ = this.factoryResolver.company$;
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.factorySite$ = this.factoryResolver.factorySite$;
    this.rooms$ = this.factoryResolver.rooms$;
    this.allRoomsOfFactorySite$ = this.factoryResolver.allRoomsOfFactorySite$;
    this.assets$ = this.factoryResolver.assets$;
    this.companyId = this.companyQuery.getActiveId();
    this.factoryAssetDetailsWithFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
  }

  ngOnDestroy() {
  }

  selectTheAssets(selectedAssetIds: Set<ID>) {
    this.selectedIds = Array.from(selectedAssetIds.values());
  }

  updateAssetData(event: FactoryAssetDetails) {
    event.id = event.id ? event.id : this.createdAssetDetailsId;
    event.companyId = this.companyId;
    this.assetService.updateCompanyAsset(this.companyId, event).subscribe(
      () => { },
      error => console.error(error)
    );
  }

  toolbarClick(button: string) {
    if (button === 'GRID') {
      this.assetQuery.setSelectedAssetIds(this.selectedIds);
      this.router.navigate(['asset-cards', this.selectedIds.join(',')], { relativeTo: this.activatedRoute });
    }
  }

  updateRoom(event: [Room, FactoryAssetDetails]) {
    const oldRoom: Room = event[0];
    const assetDetails: FactoryAssetDetails = event[1];

    assetDetails.id = assetDetails.id ? assetDetails.id : this.createdAssetDetailsId;
    this.assetService.updateCompanyAsset(assetDetails.companyId, assetDetails).subscribe(
      () => {
        if (oldRoom.id !== assetDetails.roomId) {
          this.roomService.updateRoomsAfterEditAsset(oldRoom.id, assetDetails);
        }
      },
      error => console.log(error)
    );
  }
}