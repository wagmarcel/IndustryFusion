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

package io.fusion.fusionbackend.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
public class AssetSeriesDto extends BaseAssetDto {
    private Long companyId;
    private Long assetTypeTemplateId;
    @Builder.Default
    private Set<Long> fieldSourceIds = new LinkedHashSet<>();
    @Builder.Default
    private Set<FieldSourceDto> fieldSources = new LinkedHashSet<>();
    protected Boolean ceCertified;
    protected String protectionClass;
    protected String manualKey;
    protected String videoKey;
    protected String customScript;

    private Long connectivitySettingsId;
    private ConnectivitySettingsDto connectivitySettings;

    @JsonCreator
    public AssetSeriesDto() {
    }
}
