import { NgModule } from '@angular/core';
import { CreateButtonComponent } from '../components/ui/create-button/create-button.component';
import { ItemOptionsMenuComponent } from '../components/ui/item-options-menu/item-options-menu.component';
import { ClrIconModule } from '@clr/angular';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TrashButtonComponent } from '../components/ui/trash-button/trash-button.component';
import { ConfirmButtonComponent } from '../components/ui/confirm-button/confirm-button.component';
import { EditDetailsButtonComponent } from '../components/ui/edit-details-button/edit-details-button.component';
import { EditButtonComponent } from '../components/ui/edit-button/edit-button.component';
import { LocationsMapComponent } from '../components/content/locations-map/locations-map.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@NgModule({
  declarations: [
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    ConfirmButtonComponent,
    EditButtonComponent,
    EditDetailsButtonComponent,
    LocationsMapComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ClrIconModule,
    MenuModule,
    ButtonModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsClientId
    }),
    DialogModule,
    DropdownModule,
    ButtonModule,
    MenuModule,
    InputTextModule,
    InputTextareaModule
  ],
  exports: [
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    ConfirmButtonComponent,
    EditButtonComponent,
    EditDetailsButtonComponent,
    LocationsMapComponent,
    DialogModule,
    DropdownModule,
    ButtonModule,
    MenuModule,
    InputTextModule,
    InputTextareaModule,
    RadioButtonModule,
    CheckboxModule,
    ConfirmDialogModule
  ]
})
export class IFCommon { }
