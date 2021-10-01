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

import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ID } from '@datorama/akita';

export class RouteHelpers {

  public static findParamInFullActivatedRoute(activatedRouteSnapshot: ActivatedRouteSnapshot, paramName: string): ID {
    let id = activatedRouteSnapshot.paramMap.get(paramName) as ID;
    while (id == null && activatedRouteSnapshot.parent != null) {
      activatedRouteSnapshot = activatedRouteSnapshot.parent;
      id = activatedRouteSnapshot.paramMap.get(paramName) as ID;
    }
    return id;
  }

  public static  getActiveRouteLastChild(activatedRoute: ActivatedRoute) {
    let route = activatedRoute;
    while (route.firstChild !== null) {
      route = route.firstChild;
    }
    return route;
  }

  public static  getActiveRouteSecondLastChild(activatedRoute: ActivatedRoute) {
    let route = activatedRoute;
    let prevRoute = route;
    while (route.firstChild !== null) {
      prevRoute = route;
      route = route.firstChild;
    }
    return prevRoute;
  }

  public static isRouteActive(subroute: string, activatedRoute: ActivatedRoute): boolean {
    const snapshot = activatedRoute.snapshot;
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

}