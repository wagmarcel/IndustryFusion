import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConnectivityTypeQuery } from '../../../../../core/store/connectivity-type/connectivity-type.query';
import { ConnectivityProtocol, ConnectivityType } from '../../../../../core/store/connectivity-type/connectivity-type.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetSeriesWizardNameplateAndConnectivitySettingsTooltipComponent } from './asset-series-wizard-nameplate-and-connectivity-settings-tooltip/asset-series-wizard-nameplate-and-connectivity-settings-tooltip.component';
import { AssetSeries } from '../../../../../core/store/asset-series/asset-series.model';
import { DialogType } from '../../../../../shared/models/dialog-type.model';
import { WizardHelper } from '../../../../../core/helpers/wizard-helper';
import { SelectItem } from 'primeng/api';
import { ProtectionClassService } from '../../../../../core/services/api/protection-class.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-asset-series-wizard-nameplate-and-connectivity-settings',
  templateUrl: './asset-series-wizard-nameplate-and-connectivity-settings.component.html',
  styleUrls: ['./asset-series-wizard-nameplate-and-connectivity-settings.component.scss']
})
export class AssetSeriesWizardNameplateAndConnectivitySettingsComponent implements OnInit {
  @Input() type: DialogType;
  @Input() assetSeries: AssetSeries;
  @Input() assetSeriesForm: FormGroup;
  @Output() stepChange = new EventEmitter<number>();
  @Output() valid = new EventEmitter<boolean>();

  public protectionClassOptions: SelectItem[] = [];
  public connectivitySettingsForm: FormGroup;
  public connectivityTypeOptions: ConnectivityType[];
  public connectivityProtocolOptions: ConnectivityProtocol[];
  public infoText = '';

  AssetSeriesCreateConnectivitySettingsTooltipComponent = AssetSeriesWizardNameplateAndConnectivitySettingsTooltipComponent;

  constructor(private connectivityTypeQuery: ConnectivityTypeQuery,
              private protectionClassService: ProtectionClassService,
              private translate: TranslateService,
              private formBuilder: FormBuilder) {
    this.connectivityTypeOptions = this.connectivityTypeQuery.getAll();
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.disableFormGroupOnEditMode();
    this.initProtectionClassOptions();

    this.updateConnectivityProtocolOptionsAndInfoText();
    if (this.type === DialogType.CREATE) {
      this.updateConnectivityProtocolIdAndConnectionString();
    }

    this.assetSeriesForm.addControl('connectivitySettings', this.connectivitySettingsForm);
  }

  private createFormGroup(): void {
    this.connectivitySettingsForm = this.formBuilder.group({
      connectivityTypeId: [null, Validators.required],
      connectivityProtocolId: [null, Validators.required],
      connectionString: [null, WizardHelper.requiredTextValidator],
    });
    this.connectivitySettingsForm.valueChanges.subscribe(() => this.valid.emit(this.isValid()));
    this.assetSeriesForm.valueChanges.subscribe(() => this.valid.emit(this.isValid()));

    this.connectivitySettingsForm.patchValue(this.assetSeries.connectivitySettings);
    if (this.type === DialogType.CREATE) {
      this.selectFirstItemsInDropdowns();
    }
  }

  private isValid(): boolean {
    return (this.connectivitySettingsForm.valid || this.connectivitySettingsForm.disabled) &&
      this.assetSeriesForm.get('ceCertified').valid && this.assetSeriesForm.get('protectionClass').valid;
  }

  private disableFormGroupOnEditMode() {
    if (this.type === DialogType.EDIT) {
      this.connectivitySettingsForm.get('connectivityTypeId').disable( { onlySelf: true });
      this.connectivitySettingsForm.get('connectivityProtocolId').disable( { onlySelf: true });
      this.connectivitySettingsForm.get('connectionString').disable( { onlySelf: true });
    }
  }

  private initProtectionClassOptions() {
    this.protectionClassService.getProtectionClasses().subscribe(protectionClasses => {
      protectionClasses.forEach(protectionClass => {
        this.protectionClassOptions.push({ label: protectionClass.toString(), value: protectionClass.toString() });
        this.assetSeriesForm.get('protectionClass').setValue(this.assetSeriesForm.get('protectionClass')?.value);
      });
    });
  }


  private selectFirstItemsInDropdowns(): void {
    this.connectivitySettingsForm.get('connectivityTypeId').setValue(1);
  }

  private updateConnectivityProtocolOptionsAndInfoText(): void {
    const connectivityTypeId = this.connectivitySettingsForm.get('connectivityTypeId').value;

    if (connectivityTypeId && this.connectivityTypeOptions) {
      const selectedConnectivityType = this.connectivityTypeOptions
        .find(connectivityType => String(connectivityType.id) === String(connectivityTypeId));

      this.connectivityProtocolOptions = selectedConnectivityType.availableProtocols;
      this.infoText = this.translate.instant(selectedConnectivityType.infoText);
    }
  }

  private updateConnectivityProtocolIdAndConnectionString(): void {
    if (this.connectivityProtocolOptions.length > 0) {
      this.connectivitySettingsForm.get('connectivityProtocolId').setValue(this.connectivityProtocolOptions[0].id);
      this.updateConnectionString();

    } else {
      this.connectivitySettingsForm.get('connectivityProtocolId').setValue(null);
      this.connectivitySettingsForm.get('connectionString').setValue(null);
    }
  }


  onChangeConnectivityType(): void {
    this.updateConnectivityProtocolOptionsAndInfoText();
    this.updateConnectivityProtocolIdAndConnectionString();
  }

  onChangeProtocolType(): void {
    this.updateConnectionString();
  }

  private updateConnectionString() {
    const connectivityProtocolId = this.connectivitySettingsForm.get('connectivityProtocolId').value;

    if (connectivityProtocolId && this.connectivityProtocolOptions) {
      const connectionString = this.connectivityProtocolOptions
        .find(connectivityProtocol => String(connectivityProtocol.id) === String(connectivityProtocolId)).connectionStringPattern;
      this.connectivitySettingsForm.get('connectionString').setValue(connectionString);
    }
  }
}
