// hooks/useChat.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
    Conversation,
    Message,
    TypingIndicator,
    User
} from '../types/chat.types';
import chatApiService from '../lib/chatApi.service';
import websocketService from '../lib/websocket.service';

interface UseChatReturn {
    conversations: Conversation[];
    messages: Message[];
    activeConversationId: number | null;
    typingIndicators: TypingIndicator[];
    loading: boolean;
    connected: boolean;
    error: string | null;
    setActiveConversationId: (id: number | null) => void;
    sendMessage: (content: string) => void;
    deleteMessage: (messageId: number) => void;
    sendTypingIndicator: (isTyping: boolean) => void;
    loadConversations: () => Promise<void>;
    loadMessages: (conversationId: number) => Promise<void>;
}

export const useChat = (currentUser: User | null): UseChatReturn => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messagesByConversation, setMessagesByConversation] = useState<
        Record<number, Message[]>
    >({});
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isInitializedRef = useRef(false);

    // Initialize WebSocket connection
    useEffect(() => {
        if (!currentUser || isInitializedRef.current) return;

        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            setError('No authentication token found');
            return;
        }

        isInitializedRef.current = true;

        // Setup WebSocket callbacks
        websocketService.onConnect(() => {
            console.log('WebSocket connected');
            setConnected(true);
            setError(null);
        });

        websocketService.onDisconnect(() => {
            console.log('WebSocket disconnected');
            setConnected(false);
        });

        websocketService.onMessage((message: Message) => {
            console.log('Received message:', message);

            // Add message to the appropriate conversation
            setMessagesByConversation((prev) => ({
                ...prev,
                [message.conversationId]: [
                    ...(prev[message.conversationId] || []),
                    message,
                ],
            }));

            // Update conversation's last message and updatedAt
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === message.conversationId
                        ? {
                            ...conv,
                            lastMessage: message,
                            updatedAt: message.createdAt,
                            unreadCount:
                                activeConversationId === message.conversationId
                                    ? conv.unreadCount
                                    : (conv.unreadCount || 0) + 1,
                        }
                        : conv
                )
            );
        });

        websocketService.onTyping((typing: TypingIndicator) => {
            console.log('Typing indicator:', typing);

            setTypingIndicators((prev) => {
                // Remove existing indicator for this user in this conversation
                const filtered = prev.filter(
                    (t) =>
                        !(
                            t.conversationId === typing.conversationId &&
                            t.userId === typing.userId
                        )
                );

                // Add new indicator if typing
                if (typing.isTyping) {
                    return [...filtered, typing];
                }

                return filtered;
            });
        });

        websocketService.onError((errorMsg: string) => {
            console.error('WebSocket error:', errorMsg);
            setError(errorMsg);
        });
        websocketService
            .connect(authToken)
            .catch((err) => {
                console.error('Failed to connect WebSocket:', err);
                setError('Failed to connect to chat server');
            });
        return () => {
            websocketService.disconnect();
            isInitializedRef.current = false;
        };
    }, [currentUser, activeConversationId]);

    const loadConversations = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await chatApiService.getConversations();

            if (response.success && response.data) {
                const conversationsArray = response.data.content;

                setConversations(conversationsArray);

                if (!activeConversationId && conversationsArray.length > 0) {
                    setActiveConversationId(conversationsArray[0].id);
                }

            } else {
                setError(response.error || 'Failed to load conversations');
            }
        } catch (err) {
            setError('Failed to load conversations');
            console.error(err);
        } finally {
            setLoading(false);
        }
        // Cần thêm activeConversationId vào dependency nếu bạn sử dụng nó trong useCallback
    }, [activeConversationId]);


    // Load messages for a conversation
    const loadMessages = useCallback(async (conversationId: number) => {

        console.log("-> 1. loadConversations started.");
        setLoading(true);
        setError(null);

        try {
            const response = await chatApiService.getConversationMessages(conversationId);

            if (response.success && response.data) {
                const messagesData = response.data;

                setMessagesByConversation((prev) => ({
                    ...prev,
                    [conversationId]: messagesData.content,
                }));

                // Reset unread count for this conversation
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversationId
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    )
                );
            } else {
                setError(response.error || 'Failed to load messages');
            }
        } catch (err) {
            setError('Failed to load messages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Send message
    const sendMessage = useCallback(
        async (content: string) => {
            if (!activeConversationId || !content.trim()) return;

            try {
                // Send via WebSocket for real-time
                websocketService.sendMessage(activeConversationId, content);

                // Also send via API for persistence (optional, depends on your backend)
                // await chatApiService.sendMessage({
                //   conversationId: activeConversationId,
                //   content,
                // });
            } catch (err) {
                console.error('Failed to send message:', err);
                setError('Failed to send message');
            }
        },
        [activeConversationId]
    );

    // Delete message
    const deleteMessage = useCallback(async (messageId: number) => {
        try {
            const response = await chatApiService.deleteMessage(messageId);

            if (response.success) {
                // Remove message from local state
                setMessagesByConversation((prev) => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach((convId) => {
                        updated[Number(convId)] = updated[Number(convId)].filter(
                            (msg) => msg.id !== messageId
                        );
                    });
                    return updated;
                });
            } else {
                setError(response.error || 'Failed to delete message');
            }
        } catch (err) {
            console.error('Failed to delete message:', err);
            setError('Failed to delete message');
        }
    }, []);

    // Send typing indicator
    const sendTypingIndicator = useCallback(
        (isTyping: boolean) => {
            if (!activeConversationId) return;
            websocketService.sendTypingIndicator(activeConversationId, isTyping);
        },
        [activeConversationId]
    );

    // Load conversations on mount
    useEffect(() => {
        if (currentUser) {
            loadConversations();
        }
    }, [currentUser, loadConversations]);

    // Load messages when active conversation changes
    useEffect(() => {
        if (activeConversationId) {
            loadMessages(activeConversationId);
        }
    }, [activeConversationId, loadMessages]);

    const messages = activeConversationId
        ? messagesByConversation[activeConversationId] || []
        : [];

    return {
        conversations,
        messages,
        activeConversationId,
        typingIndicators,
        loading,
        connected,
        error,
        setActiveConversationId,
        sendMessage,
        deleteMessage,
        sendTypingIndicator,
        loadConversations,
        loadMessages,
    };
};

export default useChat;