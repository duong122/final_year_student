-- Flyway migration script: V1 -- Initial Schema
-- This script creates the initial database schema for the social media application.

-- Set character set and engine for all tables
-- Using utf8mb4 for full unicode support (including emojis)
-- Using InnoDB engine for transaction and foreign key support

-- Table: users
-- Stores user account information.
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- To store hashed passwords
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: posts
-- Stores user posts, including image and caption.
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    caption TEXT,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE -- If a user is deleted, all their posts are deleted.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: comments
-- Stores comments made by users on posts.
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: likes
-- Stores likes on posts. A user can only like a post once.
CREATE TABLE likes (
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id), -- Composite primary key to ensure uniqueness
    CONSTRAINT fk_likes_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_likes_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: followers
-- Stores the follow relationships between users.
CREATE TABLE followers (
    follower_id BIGINT NOT NULL, -- The user who is following
    following_id BIGINT NOT NULL, -- The user who is being followed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id), -- Ensures a user can't follow another user more than once
    CONSTRAINT fk_followers_follower
        FOREIGN KEY (follower_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_followers_following
        FOREIGN KEY (following_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Flyway migration script: Add Chat and Notification Features
-- This script adds tables to support real-time messaging and notification functionalities.

-- =====================================================================================
-- Messaging Feature Tables
-- =====================================================================================

-- Table: conversations
-- Represents a chat thread between two or more users.
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- To easily fetch recent conversations
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: conversation_participants
-- A pivot table linking users to their conversations. This supports both direct and group chats.
CREATE TABLE conversation_participants (
    user_id BIGINT NOT NULL,
    conversation_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, conversation_id),
    CONSTRAINT fk_participants_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_participants_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: messages
-- Stores individual chat messages within a conversation.
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================================
-- Notification Feature Tables
-- =====================================================================================

-- Table: notifications
-- Stores notifications for users, such as new likes, comments, or followers.
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL, -- User who receives the notification
    sender_id BIGINT NOT NULL,    -- User who triggered the action
    type ENUM('LIKE_POST', 'COMMENT_ON_POST', 'NEW_FOLLOWER') NOT NULL,
    post_id BIGINT NULL,          -- ID of the post for LIKE/COMMENT notifications. Can be NULL for other types.
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notifications_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notifications_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Add indexes for performance optimization
-- It's good practice to add indexes to foreign key columns and frequently queried columns.
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);

-- =====================================================================================
-- Add indexes for performance optimization
-- =====================================================================================
CREATE INDEX idx_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);


CREATE TABLE saved_posts (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             user_id BIGINT NOT NULL,
                             post_id BIGINT NOT NULL,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure a user can only save a post once
                             UNIQUE KEY unique_user_post (user_id, post_id),

    -- Foreign keys
                             CONSTRAINT fk_saved_posts_user
                                 FOREIGN KEY (user_id) REFERENCES users(id)
                                     ON DELETE CASCADE,
                             CONSTRAINT fk_saved_posts_post
                                 FOREIGN KEY (post_id) REFERENCES posts(id)
                                     ON DELETE CASCADE,

    -- Indexes for performance
                             INDEX idx_saved_posts_user_id (user_id),
                             INDEX idx_saved_posts_post_id (post_id),
                             INDEX idx_saved_posts_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- Optional: Add saved_count to posts table (denormalization for performance)
-- =====================================================================================

-- Add column to posts table
ALTER TABLE posts ADD COLUMN saved_count INT DEFAULT 0;

-- Create index
CREATE INDEX idx_posts_saved_count ON posts(saved_count);

-- =====================================================================================
-- Trigger: Auto-update saved_count when user saves a post
-- =====================================================================================

DELIMITER //

CREATE TRIGGER increment_saved_count
    AFTER INSERT ON saved_posts
    FOR EACH ROW
BEGIN
    UPDATE posts
    SET saved_count = saved_count + 1
    WHERE id = NEW.post_id;
END//

CREATE TRIGGER decrement_saved_count
    AFTER DELETE ON saved_posts
    FOR EACH ROW
BEGIN
    UPDATE posts
    SET saved_count = GREATEST(0, saved_count - 1)
    WHERE id = OLD.post_id;
END//

DELIMITER ;


INSERT INTO users (id, username, email, password, full_name, avatar_url, bio, created_at, updated_at)
VALUES (
           1,
           'linkly_assistant',
           'bot@linkly.com',
           '$2a$10$dummyHashedPasswordForBot', -- Dummy password, bot không login
           'Linkly Assistant',
           'https://api.dicebear.com/7.x/bottts/svg?seed=linkly', -- Avatar bot
           'Hi! I am Linkly Assistant. I am here to help you with anything you need. Feel free to ask me questions!',
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       ) ON DUPLICATE KEY UPDATE id=id; -- Tránh lỗi nếu đã tồn tại

-- =====================================================================================
-- Bước 2: Tạo Chatbot Conversations Table
-- =====================================================================================

CREATE TABLE IF NOT EXISTS chatbot_conversations (
                                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                     user_id BIGINT NOT NULL,
                                                     conversation_id BIGINT NOT NULL, -- Link đến conversation table hiện có
                                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign keys
                                                     CONSTRAINT fk_chatbot_conv_user
                                                         FOREIGN KEY (user_id) REFERENCES users(id)
                                                             ON DELETE CASCADE,
                                                     CONSTRAINT fk_chatbot_conv_conversation
                                                         FOREIGN KEY (conversation_id) REFERENCES conversations(id)
                                                             ON DELETE CASCADE,

    -- Ensure one chatbot conversation per user
                                                     UNIQUE KEY unique_user_chatbot (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- Bước 3: Tạo Chatbot Messages Table (để track context)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS chatbot_messages (
                                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                chatbot_conversation_id BIGINT NOT NULL,
                                                role ENUM('user', 'assistant', 'system') NOT NULL,
                                                content TEXT NOT NULL,
                                                message_id BIGINT NULL, -- Link đến message table hiện có (optional)
                                                tokens_used INT DEFAULT 0,
                                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
                                                CONSTRAINT fk_chatbot_msg_conversation
                                                    FOREIGN KEY (chatbot_conversation_id) REFERENCES chatbot_conversations(id)
                                                        ON DELETE CASCADE,
                                                CONSTRAINT fk_chatbot_msg_message
                                                    FOREIGN KEY (message_id) REFERENCES messages(id)
                                                        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- Bước 4: Tạo Indexes cho Performance
-- =====================================================================================

CREATE INDEX idx_chatbot_conv_user ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conv_conversation ON chatbot_conversations(conversation_id);
CREATE INDEX idx_chatbot_msg_conversation ON chatbot_messages(chatbot_conversation_id);
CREATE INDEX idx_chatbot_msg_created ON chatbot_messages(created_at);

-- =====================================================================================
-- Bước 5: Tạo System Prompt Template (Optional)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS chatbot_prompts (
                                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                               name VARCHAR(100) NOT NULL UNIQUE,
                                               system_prompt TEXT NOT NULL,
                                               is_active BOOLEAN DEFAULT TRUE,
                                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system prompt
INSERT INTO chatbot_prompts (name, system_prompt, is_active)
VALUES (
           'default',
           'You are Linkly Assistant, a helpful AI assistant for the Linkly social media platform (similar to Instagram). Your role is to:

       1. Help users understand how to use Linkly features (posts, messages, stories, notifications, saved posts)
       2. Answer questions about the platform
       3. Provide friendly and concise responses
       4. Suggest creative captions and hashtags when asked
       5. Guide new users through onboarding

       Important guidelines:
       - Keep responses concise and friendly
       - Use emojis occasionally to be more engaging
       - If you do not know something, be honest
       - Never share fake information
       - Be respectful and professional
       - Respond in the same language as the user (Vietnamese or English)

       Current features of Linkly:
       - Create and share posts with photos
       - Like and comment on posts
       - Direct messaging with other users
       - Save posts for later
       - Receive notifications
       - Explore trending content
       - Follow other users',
           TRUE
       ) ON DUPLICATE KEY UPDATE system_prompt=VALUES(system_prompt);