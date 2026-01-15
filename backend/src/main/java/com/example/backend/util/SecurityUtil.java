package com.example.backend.util;

import com.example.backend.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    /**
     * Lấy userId của user hiện tại từ SecurityContext
     * @return userId
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User chưa đăng nhập");
        }

        Object principal = authentication.getPrincipal();

        // Kiểm tra nếu principal là UserPrincipal
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getId();
        }

        // Fallback: nếu principal là String (username hoặc userId dạng string)
        if (principal instanceof String) {
            try {
                return Long.parseLong((String) principal);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid userId format");
            }
        }

        throw new RuntimeException("Không thể lấy userId từ SecurityContext. Principal type: " + principal.getClass().getName());
    }

    /**
     * Lấy username của user hiện tại
     * @return username
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User chưa đăng nhập");
        }

        Object principal = authentication.getPrincipal();

        // Nếu principal là UserPrincipal
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getUsername();
        }

        // Fallback: getName() từ Authentication
        return authentication.getName();
    }

    /**
     * Lấy email của user hiện tại
     * @return email
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User chưa đăng nhập");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getEmail();
        }

        throw new RuntimeException("Không thể lấy email từ SecurityContext");
    }

    /**
     * Lấy UserPrincipal hiện tại
     * @return UserPrincipal
     */
    public static UserPrincipal getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User chưa đăng nhập");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserPrincipal) {
            return (UserPrincipal) principal;
        }

        throw new RuntimeException("Principal không phải là UserPrincipal");
    }

    /**
     * Kiểm tra user đã đăng nhập chưa
     * @return true nếu đã đăng nhập
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof UserPrincipal;
    }
}