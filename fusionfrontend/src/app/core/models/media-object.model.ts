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

import { ID } from '@datorama/akita';

export class MediaObject {
  companyId: ID;
  fileKey: string;
  contentBase64: string;
  contentType: string;
  fileSize: number;
  filename?: string;

  constructor(companyId: ID, filename: string, folder: string, contentBase64: string, contentType: string, fileSize: number) {
    this.companyId = companyId;
    this.fileKey = folder.toLowerCase() + '/' + filename;
    this.contentBase64 = contentBase64;
    this.contentType = contentType;
    this.fileSize = fileSize;
    this.filename = filename;
  }

  public static getFilename(fileKey: string) {
    const fileNameWithUuid = fileKey.split('/').pop();
    const uuidLength = fileNameWithUuid.split('_')[0].length;
    return fileNameWithUuid.substring(uuidLength + 1);
  }

  public static getUriSchemeString(mediaObject: MediaObject): string {
    if (!mediaObject.contentBase64.startsWith('data')) {
      return `data:${mediaObject.contentType};base64,${mediaObject.contentBase64}`;
    }
    return mediaObject.contentBase64;
  }
}

export enum MediaObjectKeyPrefix {
  ASSETS = 'assets',
  ASSET_SERIES = 'assetseries'
}

export enum MediaObjectType {
  IMAGES = 'images',
  VIDEOS = 'videos',
  MANUALS = 'manuals',
}
