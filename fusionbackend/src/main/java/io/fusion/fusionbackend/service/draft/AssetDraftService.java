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

package io.fusion.fusionbackend.service.draft;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.Room;
import io.fusion.fusionbackend.model.enums.FactorySiteType;
import io.fusion.fusionbackend.service.AssetSeriesService;
import io.fusion.fusionbackend.service.FieldInstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetDraftService {
    private final FieldInstanceService fieldInstanceService;
    private final RoomDraftService roomDraftService;
    private final AssetSeriesService assetSeriesService;

    @Autowired
    public AssetDraftService(FieldInstanceService fieldInstanceService,
                             RoomDraftService roomDraftService,
                             AssetSeriesService assetSeriesService) {
        this.fieldInstanceService = fieldInstanceService;
        this.roomDraftService = roomDraftService;
        this.assetSeriesService = assetSeriesService;
    }

    public Asset initAssetDraft(final Long companyId, final Long assetSeriesId) {
        final AssetSeries assetSeries = this.assetSeriesService.getAssetSeriesByCompany(companyId, assetSeriesId);
        final Company company = assetSeries.getCompany();
        final Room unspecificRoom = initUnspecificRoomDraft(companyId);

        final Asset transientAsset = Asset.builder()
                .name(assetSeries.getName())
                .externalName(null)
                .description(assetSeries.getDescription())
                .ceCertified(assetSeries.getCeCertified())
                .manualKey(assetSeries.getManualKey())
                .protectionClass(assetSeries.getProtectionClass())
                .imageKey(assetSeries.getImageKey())
                .videoKey(assetSeries.getVideoKey())
                .installationDate(null)
                .constructionDate(OffsetDateTime.now())
                .room(unspecificRoom)
                .company(company)
                .assetSeries(assetSeries)
                .connectionString(assetSeries.getConnectivitySettings().getConnectionString())
                .guid(UUID.randomUUID())
                .build();

        List<FieldInstance> newFieldInstances = assetSeries.getFieldSources().stream()
                .map(fieldInstanceService::initFieldInstanceDraft)
                .collect(Collectors.toList());
        transientAsset.getFieldInstances().addAll(newFieldInstances);

        return transientAsset;
    }

    public Room initUnspecificRoomDraft(final Long companyId) {
        return roomDraftService.initUnspecificRoomDraftWithFactorySite(companyId, FactorySiteType.FLEETMANAGER);
    }
}
