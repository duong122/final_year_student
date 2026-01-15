package com.example.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.FileUploadException;
import com.example.backend.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final Cloudinary cloudinary;

    @Value("${file.max-size:10485760}") // 5MB default
    private long maxFileSize;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        validateFile(file);

        try {
            // Tạo public_id unique
            String publicId = folder + "/" + UUID.randomUUID().toString();

            // Upload lên Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", folder,
                            "resource_type", "image",
                            "transformation", new com.cloudinary.Transformation()
                                    .quality("auto")  // Tự động optimize chất lượng
                                    .fetchFormat("auto")  // Tự động chọn format tốt nhất
                    )
            );

            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("File uploaded successfully to Cloudinary: {}", imageUrl);

            return imageUrl;

        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary", e);
            throw new FileUploadException("Không thể upload file: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.isEmpty()) {
                return;
            }

            // Extract public_id từ URL
            String publicId = extractPublicId(imageUrl);

            if (publicId != null && !publicId.isEmpty()) {
                Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("File deleted from Cloudinary: {} - Result: {}", publicId, result.get("result"));
            }

        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary: {}", imageUrl, e);
            // Không throw exception để không ảnh hưởng đến việc xóa post
        }
    }

    @Override
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }

        // Kiểm tra kích thước
        if (file.getSize() > maxFileSize) {
            throw new BadRequestException(
                    "File vượt quá kích thước cho phép: " + (maxFileSize / 1024 / 1024) + "MB"
            );
        }

        // Kiểm tra loại file
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Chỉ chấp nhận file ảnh: JPG, JPEG, PNG, GIF, WEBP");
        }

        // Kiểm tra tên file
        String filename = file.getOriginalFilename();
        if (filename == null || filename.contains("..")) {
            throw new BadRequestException("Tên file không hợp lệ");
        }
    }

    @Override
    public String extractPublicId(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }

        try {
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
            // Ví dụ: https://res.cloudinary.com/demo/image/upload/v1234567890/linkly/avatars/abc-def-ghi.jpg

            // Lấy phần sau "/upload/"
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) {
                return null;
            }

            // Lấy phần path (bỏ version nếu có)
            String path = parts[1];

            // Bỏ version (v1234567890/)
            if (path.matches("^v\\d+/.*")) {
                path = path.substring(path.indexOf('/') + 1);
            }

            // Bỏ extension (.jpg, .png, etc.)
            int lastDotIndex = path.lastIndexOf('.');
            if (lastDotIndex > 0) {
                path = path.substring(0, lastDotIndex);
            }

            return path;

        } catch (Exception e) {
            log.error("Failed to extract public_id from URL: {}", imageUrl, e);
            return null;
        }
    }
}