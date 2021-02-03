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

import { ActiveState, EntityState, EntityStore, StoreConfig, ID } from '@datorama/akita';
import { Metric } from './metric.model';
import { Injectable } from '@angular/core';

export interface MetricState extends EntityState<Metric, ID>, ActiveState { }

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'metric', resettable: true })
export class MetricStore extends EntityStore<MetricState, Metric> {

  constructor() {
    super(initialState);
  }

}