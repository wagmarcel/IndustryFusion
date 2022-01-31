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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KairosStatusAggregationService, TimeInterval } from './kairos-status-aggregation.service';
import { Shift } from '../../store/factory-site/factory-site.model';

describe('KairosStatusAggregationService', () => {
  let component: KairosStatusAggregationService;
  let fixture: ComponentFixture<KairosStatusAggregationService>;
  let shifts: Shift[];
  const dateToday: Date = new Date(Date.now());

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KairosStatusAggregationService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KairosStatusAggregationService);
    component = fixture.componentInstance;
    shifts = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('correct segmentation of shift into 1 interval', () => {
    shifts.push(Shift.create('Morning shift', 5 * 60, 13 * 60 + 30 ));
    shifts.push(Shift.create('Dayshift',      13 * 60, 21 * 60 ));
    shifts.push(Shift.create('Night shift',    21 * 60, 4 * 60 + 30 ));

    const boundingInterval = KairosStatusAggregationService.getBoundingIntervalOfShiftsOfDate(dateToday, shifts);
    const intervals = KairosStatusAggregationService.getCorrectedIntervalsOfShifts(boundingInterval, shifts);

    const expectedIntervals: TimeInterval[] = [new TimeInterval(shifts[0].startMinutes,
      KairosStatusAggregationService.getCorrectedEndMinutes(shifts[2]))];

    expect(intervals).toEqual(expectedIntervals);
  });

  it('correct segmentation of shift into 2 intervals', () => {
    shifts.push(Shift.create('Shift 1', 5 * 60, 13 * 60 + 30 ));
    shifts.push(Shift.create('Shift 2',    21 * 60, 4 * 60 + 30 ));

    const boundingInterval = KairosStatusAggregationService.getBoundingIntervalOfShiftsOfDate(dateToday, shifts);
    const intervals = KairosStatusAggregationService.getCorrectedIntervalsOfShifts(boundingInterval, shifts);

    const expectedIntervals: TimeInterval[] = [new TimeInterval(shifts[0].startMinutes, shifts[0].endMinutes),
      new TimeInterval(shifts[1].startMinutes, KairosStatusAggregationService.getCorrectedEndMinutes(shifts[1]))];

    expect(intervals).toEqual(expectedIntervals);
  });

  it('correct segmentation of shift into 2 intervals of three shifts', () => {
    shifts.push(Shift.create('Shift 1', 5 * 60, 13 * 60 + 30 ));
    shifts.push(Shift.create('Shift 2',    15 * 60, 22 * 60 ));
    shifts.push(Shift.create('Shift 3',    21 * 60, 6 * 60 ));

    const boundingInterval = KairosStatusAggregationService.getBoundingIntervalOfShiftsOfDate(dateToday, shifts);
    const intervals = KairosStatusAggregationService.getCorrectedIntervalsOfShifts(boundingInterval, shifts);

    const expectedIntervals: TimeInterval[] = [new TimeInterval(shifts[0].startMinutes, shifts[0].endMinutes),
      new TimeInterval(shifts[1].startMinutes, KairosStatusAggregationService.getCorrectedEndMinutes(shifts[2]))];

    expect(intervals).toEqual(expectedIntervals);
  });

  it('correct segmentation of shift into 3 intervals', () => {
    shifts.push(Shift.create('Shift 1', 0, 11 * 60 ));
    shifts.push(Shift.create('Shift 2',      13 * 60, 20 * 60 ));
    shifts.push(Shift.create('Shift 3',    21 * 60, 4 * 60 ));

    const boundingInterval = KairosStatusAggregationService.getBoundingIntervalOfShiftsOfDate(dateToday, shifts);
    const intervals = KairosStatusAggregationService.getCorrectedIntervalsOfShifts(boundingInterval, shifts);

    const expectedIntervals: TimeInterval[] = [new TimeInterval(shifts[0].startMinutes, shifts[0].endMinutes),
      new TimeInterval(shifts[1].startMinutes, shifts[1].endMinutes),
      new TimeInterval(shifts[2].startMinutes, KairosStatusAggregationService.getCorrectedEndMinutes(shifts[2]))];

    expect(intervals).toEqual(expectedIntervals);
  });
});
