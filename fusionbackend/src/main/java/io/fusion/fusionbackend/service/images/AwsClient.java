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

package io.fusion.fusionbackend.service.images;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import io.fusion.fusionbackend.exception.ExternalApiException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import org.jetbrains.annotations.NotNull;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

// see https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/examples-s3-objects.html#upload-object
// and https://javatutorial.net/java-s3-example
public abstract class AwsClient {

    private static final String ENDPOINT_URL = "http://s3-de-central.profitbricks.com:80";

    protected final AmazonS3 s3Client;
    protected final String bucketName;
    protected final Long companyId;
    protected String basePath;

    public AwsClient(@NotNull final Long companyId, @NotNull final String accessKey,  @NotNull final String secretKey) {
        this.companyId = companyId;
        this.s3Client = createClient(accessKey, secretKey);
        this.bucketName = "industryfusion";
        this.basePath = "company" + companyId + "/";

        assert existBucket(this.bucketName);
    }

    private AmazonS3 createClient(final String accessKey, final String secretKey) {
        AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        return AmazonS3ClientBuilder
                .standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(
                        ENDPOINT_URL, "eu-west-1"))
                .build();
    }

    protected String getFilePath(final String fileKey) {
        return this.basePath + fileKey;
    }

    protected String getFileExtension(final String filename) {
        String[] parts = filename.split("\\.");
        if (parts.length < 1) {
            throw new IllegalArgumentException();
        }
        return parts[parts.length - 1];
    }

    public boolean existBucket(final String bucketName) {
        try {
            return s3Client.doesBucketExistV2(bucketName);
        } catch (Exception e) {
            return false;
        }
    }

    public byte[] getFile(@NotNull final String fileKey) throws ResourceNotFoundException {

        try {
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                s3Client.getObject(new GetObjectRequest(bucketName, getFilePath(fileKey))).getObjectContent()
                        .transferTo(outputStream);

                return outputStream.toByteArray();
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResourceNotFoundException();
        }
    }

    protected Long getFileSizeFrom64Based(final String imageContent64Based) {
        return imageContent64Based.length() * 3L / 4L;
    }

    protected abstract String getContentType(String key);

    protected abstract boolean isContentTypeInvalid(final String contentTypeLowerCase);

    public abstract Long getMaxFileSizeMb();

    protected boolean isFileSizeInvalid(final String imageContent64Based) {
        return getFileSizeFrom64Based(imageContent64Based) > getMaxFileSizeMb() * 1024 * 1024;
    }

    protected void uploadFile(final byte[] imageContent,
                              final String fileExtension,
                              final String destinationPath) {

        File tempFile = createTempFile(imageContent, fileExtension);
        assert tempFile != null;

        try {
            if (!existFolder(basePath)) {
                createEmptyFolder(basePath);
            }
            s3Client.putObject(new PutObjectRequest(bucketName, destinationPath, tempFile));

        } catch (AmazonServiceException e) {
            e.printStackTrace();
            throw new ExternalApiException();

        } finally {
            deleteTempFile(tempFile);
        }
    }

    protected File createTempFile(final byte[] content, final String fileExtension) {
        try {
            String tempDir = System.getProperty("java.io.tmpdir");

            File dir = new File(tempDir);
            File file = File.createTempFile(".if-", "." + fileExtension, dir);

            FileOutputStream fileOutputStream = new FileOutputStream(file.getAbsolutePath());
            fileOutputStream.write(content);
            fileOutputStream.close();

            return file;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    protected void deleteTempFile(File file) {
        file.deleteOnExit();
    }

    private void createEmptyFolder(@NotNull String folderPath) {
        if (!folderPath.endsWith("/")) {
            folderPath = folderPath + '/';
        }

        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(0);
            InputStream emptyContent = new ByteArrayInputStream(new byte[0]);

            s3Client.putObject(new PutObjectRequest(bucketName, folderPath, emptyContent, metadata));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        }
    }

    public boolean existFolder(@NotNull String folderPath) {
        if (!folderPath.endsWith("/")) {
            folderPath = folderPath + '/';
        }

        try {
            s3Client.getObject(new GetObjectRequest(bucketName, folderPath));
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
