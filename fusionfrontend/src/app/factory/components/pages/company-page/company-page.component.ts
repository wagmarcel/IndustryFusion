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
import { Observable } from 'rxjs';
import { Company } from 'src/app/store/company/company.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { ID } from '@datorama/akita';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { ActivatedRoute } from '@angular/router';
import { LocationService } from 'src/app/store/location/location.service';
import { Location } from 'src/app/store/location/location.model';

@Component({
  selector: 'app-company-page',
  templateUrl: './company-page.component.html',
  styleUrls: ['./company-page.component.scss']
})
export class CompanyPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  selectedLocation: ID;

  constructor(private companyQuery: CompanyQuery,
    private factoryResolver: FactoryResolver,
    private locationService: LocationService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading$ = this.companyQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.company$ = this.companyQuery.selectActive();
  }

  ngOnDestroy() {
  }

  setSelectedLocation(id: ID) {
    this.selectedLocation = id;
  }

  locationCreated(location: Location) {
    const createLocation$ = this.locationService.createLocation(location);
    createLocation$.subscribe(
      location => {
        console.log('[company page] created location: ' + location.name);
      },
      error => console.log(error)
    );
  }

  locationUpdated(location: Location) {
    const createLocation$ = this.locationService.updateLocation(location);
    createLocation$.subscribe(
      location => {
        console.log('[company page] updated location: ' + location.name);
      },
      error => console.log(error)
    );
  }
}
