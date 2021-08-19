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

import { Pipe, PipeTransform } from '@angular/core';
import { FactoryAssetDetailsWithFields } from '../store/factory-asset-details/factory-asset-details.model';

@Pipe({ name: 'maintenanceSort' })
export class MaintenanceAssetSortPipe implements PipeTransform {

  transform(assets: FactoryAssetDetailsWithFields[], fieldName: string): any[] {
    if (!assets) {
      return assets;
    }
    return assets.sort((a, b) => {
      const indexA = a.fields.findIndex(field => field.name === fieldName);
      const indexB = b.fields.findIndex(field => field.name === fieldName);
      if (indexA !== -1 && indexB !== -1) {
        return Number(a.fields[indexA].value) > Number(b.fields[indexB].value) ? 1 : -1;
      } else if (indexA === -1) {
        return 1;
      } else {
        return -1;
      }
    });

  }
}