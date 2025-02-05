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
import { ID } from '@datorama/akita';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FactorySite, FactorySiteType } from '../../../../core/store/factory-site/factory-site.model';
import { AssetQuery } from '../../../../core/store/asset/asset.query';
import { Asset } from '../../../../core/store/asset/asset.model';
import { FactorySiteQuery } from '../../../../core/store/factory-site/factory-site.query';
import { RoomQuery } from '../../../../core/store/room/room.query';
import { map } from 'rxjs/operators';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { AssetSeriesDetails } from '../../../../core/store/asset-series-details/asset-series-details.model';
import { AssetSeriesDetailsQuery } from '../../../../core/store/asset-series-details/asset-series-details.query';
import { AssetSeriesDetailsService } from '../../../../core/store/asset-series-details/asset-series-details.service';
import { Company } from '../../../../core/store/company/company.model';
import { TranslateService } from '@ngx-translate/core';
import { AssetService } from '../../../../core/store/asset/asset.service';
import { ItemOptionsMenuType } from 'src/app/shared/components/ui/item-options-menu/item-options-menu.type';
import { AssetSeriesDetailMenuService } from '../../../../core/services/menu/asset-series-detail-menu.service';
import { FleetAssetDetailMenuService } from '../../../../core/services/menu/fleet-asset-detail-menu.service';

@Component({
  selector: 'app-asset-series-overview-page',
  templateUrl: './asset-series-overview-page.component.html',
  styleUrls: ['./asset-series-overview-page.component.scss']
})
export class AssetSeriesOverviewPageComponent implements OnInit, OnDestroy {

  assetSerieId: ID;
  assetSerieDetails$: Observable<AssetSeriesDetails>;

  factorySites$: Observable<FactorySite[]>;
  assetsCombined$: Observable<AssetCombined[]>;

  assetsMapping: { [k: string]: string } = {
    '=0': this.translate.instant('APP.FLEET.PAGES.ASSET_SERIES_OVERVIEW.NO_ASSETS'),
    '=1': '# ' + this.translate.instant('APP.COMMON.TERMS.ASSET'),
    other: '# ' + this.translate.instant('APP.COMMON.TERMS.ASSETS')
  };
  of = of;
  factorySiteTypes = FactorySiteType;
  ItemOptionsMenuType = ItemOptionsMenuType;

  private activeListItem: AssetCombined;

  constructor(private assetSeriesDetailsQuery: AssetSeriesDetailsQuery,
              private assetSeriesDetailsService: AssetSeriesDetailsService,
              private assetQuery: AssetQuery,
              private assetService: AssetService,
              private activatedRoute: ActivatedRoute,
              private roomQuery: RoomQuery,
              private companyQuery: CompanyQuery,
              private factorySiteQuery: FactorySiteQuery,
              private route: ActivatedRoute,
              private fleetAssetDetailMenuService: FleetAssetDetailMenuService,
              private assetSeriesDetailMenuService: AssetSeriesDetailMenuService,
              private translate: TranslateService) {
    this.resolve(this.activatedRoute);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.assetSeriesDetailsQuery.resetError();
  }

  resolve(activatedRoute: ActivatedRoute): void {
    const assetSeriesId = activatedRoute.snapshot.paramMap.get('assetSeriesId');
    if (assetSeriesId != null) {
      this.assetSerieDetails$ = this.assetSeriesDetailsQuery.selectEntity(assetSeriesId);
      this.assetSerieId = assetSeriesId;
      this.assetSeriesDetailsService.setActive(this.assetSerieId);

      const assets$ = this.assetQuery.selectAssetsOfAssetSerie(assetSeriesId);
      const rooms$ = this.roomQuery.selectAll();
      const factorySites$ = this.factorySiteQuery.selectAll();
      const companies$ = this.companyQuery.selectAll();

      this.assetsCombined$ = combineLatest([assets$, factorySites$, rooms$, companies$]).pipe(
        map((([assets, factorySites, rooms, companies]) => {
            const combined = [];
            for (const asset of assets) {
              const factorySite = factorySites.find(
                factorySiteValue => factorySiteValue.id === rooms.find(
                  roomValue => roomValue.id === asset.roomId
                )?.factorySiteId
              );
              const assetCompany = companies.find(company => company.id === asset.companyId);
              combined.push({ id: asset.id, asset, factorySite, company: assetCompany });
            }
            return combined;
          })
        ));

      this.factorySites$ = this.assetsCombined$.pipe(
        map(assetsCombinedArray => assetsCombinedArray.map(assetsCombined => assetsCombined.factorySite)
          .filter(factorySite => factorySite != null))
      );
    }
  }

  createAssetFromAssetSeries() {
    this.assetSeriesDetailMenuService.showPrefilledCreateAssetWizardAndRefresh(this.assetSerieId, () => this.resolve(this.route));
  }

  setActiveRow(assetCombined: AssetCombined) {
    this.activeListItem = assetCombined;
  }

  openAssetEditWizard() {
    this.fleetAssetDetailMenuService.showEditWizardAndRefresh(this.activeListItem.asset);
  }

  openAssetDeleteDialog() {
    this.fleetAssetDetailMenuService.showDeleteDialog('asset-series-asset-delete-dialog', this.activeListItem.asset.name,
      () => this.assetService.removeCompanyAsset(this.companyQuery.getActiveId(), this.activeListItem.asset.id)
        .subscribe());
  }
}

class AssetCombined {
  id: ID;
  asset: Asset;
  factorySite: FactorySite;
  company: Company;
}
