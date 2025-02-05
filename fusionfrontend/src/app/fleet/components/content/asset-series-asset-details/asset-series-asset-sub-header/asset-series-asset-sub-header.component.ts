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
import { Location } from '@angular/common';
import { RouteHelpers } from '../../../../../core/helpers/route-helpers';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FleetAssetDetailsQuery } from '../../../../../core/store/fleet-asset-details/fleet-asset-details.query';
import { FleetAssetDetailsWithFields } from '../../../../../core/store/fleet-asset-details/fleet-asset-details.model';
import { FleetComposedQuery } from '../../../../../core/store/composed/fleet-composed.query';

@Component({
  selector: 'app-asset-series-asset-sub-header',
  templateUrl: './asset-series-asset-sub-header.component.html',
  styleUrls: ['./asset-series-asset-sub-header.component.scss']
})
export class AssetSeriesAssetSubHeaderComponent implements OnInit, OnDestroy {

  assetId: ID;
  assetWithFields$: Observable<FleetAssetDetailsWithFields>;

  private unSubscribe$ = new Subject<void>();

  constructor(public activatedRoute: ActivatedRoute,
              private router: Router,
              private routingLocation: Location,
              private fleetAssetDetailsQuery: FleetAssetDetailsQuery,
              private fleetComposedQuery: FleetComposedQuery) {
  }

  ngOnInit() {
    this.activatedRoute.fragment.subscribe(() => {
      this.updateAsset();
    });
    this.fleetAssetDetailsQuery.selectLoading();
    this.updateAsset();
  }

  updateAsset() {
    this.assetId = this.fleetAssetDetailsQuery.getActiveId();
    this.assetWithFields$ = this.fleetComposedQuery.selectActivesAssetWithFieldInstanceDetails()
      .pipe(takeUntil(this.unSubscribe$));
  }

  onRouteClick(subroute: string, subroute2: string = null): Promise<boolean> {
    let newRoute = subroute2 ? ['..', subroute, subroute2] : ['..', subroute];
    if (RouteHelpers.matchFullRoute(this.routingLocation.path(), `\/assets\/[0-9]*`)) {
      newRoute = newRoute.slice(1, newRoute.length);
    }

    const relativeToRoute = RouteHelpers.getActiveRouteLastChild(this.activatedRoute);
    return this.router.navigate(newRoute, { relativeTo: relativeToRoute });
  }

  isRouteActive(subroute: string, useAsDefault: boolean = false): boolean {
    const url = this.routingLocation.path();
    if (useAsDefault && url.endsWith(`${this.assetId}`)) {
      return true;
    }
    return url.split('/').includes(subroute);
  }

  isDigitalNameplate() {
    return this.isRouteActive('digital-nameplate', true);
  }

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

}
