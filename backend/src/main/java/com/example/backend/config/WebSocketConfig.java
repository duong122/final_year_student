package com.example.backend.config;

import com.example.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.example.backend.security.CustomUserDetailsService;

/**
 * WebSocket Configuration cho Real-time Messaging
 */
@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple broker cho việc gửi message đến clients
        registry.enableSimpleBroker("/topic", "/queue");
        
        // Prefix cho messages từ client đến server
        registry.setApplicationDestinationPrefixes("/app");
        
        // Prefix cho user-specific messages
        registry.setUserDestinationPrefix("/user");
        
        log.info("✅ Message broker configured: /topic, /queue with prefix /app");
    }

@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS()
            .setStreamBytesLimit(512 * 1024)
            .setHttpMessageCacheSize(1000)
            .setDisconnectDelay(30 * 1000);
    
    log.info("✅ SockJS endpoint registered at /ws");
    log.info("✅ Allowed origins: *");
}

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor == null) {
                    log.warn("⚠️ StompHeaderAccessor is null");
                    return message;
                }

                // Chỉ xử lý CONNECT commands
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    log.info("========== WEBSOCKET CONNECTION ATTEMPT ==========");
                    
                    try {
                        // Lấy JWT token từ Authorization header
                        String authToken = accessor.getFirstNativeHeader("Authorization");
                        
                        log.debug("Authorization header: {}", authToken != null ? "Present" : "Missing");
                        
                        if (authToken != null && authToken.startsWith("Bearer ")) {
                            String token = authToken.substring(7);
                            log.debug("Token extracted (first 20 chars): {}...", 
                                token.length() > 20 ? token.substring(0, 20) : token);
                            
                            // Validate token
                            if (jwtTokenProvider.validateToken(token)) {
                                // ⭐ FIX: Sử dụng đúng method name
                                // Thử cả 2 variants phổ biến
                                Long userId = null;
                                try {
                                    // Variant 1: getUserIdFromJWT
                                    userId = jwtTokenProvider.getUserIdFromToken(token);
                                } catch (Exception e) {
                                    try {
                                        // Variant 2: getUserIdFromToken
                                        userId = jwtTokenProvider.getUserIdFromToken(token);
                                    } catch (Exception e2) {
                                        log.error("❌ Failed to extract userId from token", e2);
                                    }
                                }

                                if (userId != null) {
                                    log.info("✅ Token validated successfully for user ID: {}", userId);
                                    
                                    // Load user details
                                    UserDetails userDetails = customUserDetailsService.loadUserById(userId);
                                    log.debug("User details loaded: {}", userDetails.getUsername());
                                    
                                    // Create authentication
                                    UsernamePasswordAuthenticationToken authentication = 
                                        new UsernamePasswordAuthenticationToken(
                                            userDetails, 
                                            null, 
                                            userDetails.getAuthorities()
                                        );
                                    
                                    // Set authentication in context and accessor
                                    SecurityContextHolder.getContext().setAuthentication(authentication);
                                    accessor.setUser(authentication);
                                    
                                    log.info("✅ WebSocket authenticated for user: {}", userDetails.getUsername());
                                    log.info("==================================================");
                                } else {
                                    log.error("❌ Failed to extract user ID from valid token");
                                }
                            } else {
                                log.warn("⚠️ Token validation failed - Invalid token");
                            }
                        } else {
                            log.warn("⚠️ No valid Authorization header found");
                            log.debug("Available headers: {}", accessor.toNativeHeaderMap().keySet());
                        }
                    } catch (Exception e) {
                        log.error("❌ Error during WebSocket authentication", e);
                    }
                }
                
                return message;
            }
        });
        
        log.info("✅ WebSocket channel interceptor configured");
    }
}