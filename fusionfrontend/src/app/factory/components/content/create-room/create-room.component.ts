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

import { Component, OnInit } from '@angular/core';
import { Room } from 'src/app/store/room/room.model';
import { Location } from 'src/app/store/location/location.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent implements OnInit {

  roomForm: FormGroup;
  rooms: Room[];
  locations: Location[];
  locationSelected: boolean;
  editMode: boolean;
  room: Room;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig) {
  }

  ngOnInit() {
    this.room = this.config.data.room ? { ...this.config.data.room } : new Room();
    this.roomForm = this.config.data.roomForm;
    this.rooms = this.config.data.rooms;
    this.locations = this.config.data.locations;
    this.locationSelected = this.config.data.locationSelected;
    this.editMode = this.config.data.editMode;
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    this.updateRoomData();
    this.ref.close(this.room);
  }

  updateRoomData() {
    this.room.description = this.roomForm.get('description').value;
    this.room.name = this.roomForm.get('name').value;
    this.room.locationId = this.roomForm.get('locationId').value;
  }
}
