package com.example.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {

    /**
     * Upload file lên Cloudinary
     * @param file MultipartFile cần upload
     * @param folder Thư mục trên Cloudinary (avatars, posts, etc.)
     * @return URL của ảnh đã upload
     */
    String uploadFile(MultipartFile file, String folder);

    /**
     * Xóa file từ Cloudinary
     * @param imageUrl URL của ảnh cần xóa
     */
    void deleteFile(String imageUrl);

    /**
     * Validate file trước khi upload
     * @param file File cần validate
     */
    void validateFile(MultipartFile file);

    /**
     * Lấy public_id từ Cloudinary URL
     * @param imageUrl URL của ảnh
     * @return public_id
     */
    String extractPublicId(String imageUrl);
}