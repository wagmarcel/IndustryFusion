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

package io.fusion.fusionbackend.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "shift")
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_shift")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Shift extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long startMinutes;

    @Column(nullable = false)
    private Long endMinutes;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "shifts_of_day_id", nullable = false)
    private ShiftsOfDay shiftsOfDay;

    public void copyFrom(final Shift sourceShiftsOfDay) {

        super.copyFrom(sourceShiftsOfDay);

        if (sourceShiftsOfDay.getName() != null) {
            setName(sourceShiftsOfDay.getName());
        }
        if (sourceShiftsOfDay.getStartMinutes() != null) {
            setStartMinutes(sourceShiftsOfDay.getStartMinutes());
        }
        if (sourceShiftsOfDay.getEndMinutes() != null) {
            setEndMinutes(sourceShiftsOfDay.getEndMinutes());
        }
        if (sourceShiftsOfDay.getShiftsOfDay() != null) {
            setShiftsOfDay(sourceShiftsOfDay.getShiftsOfDay());
        }
    }
}
