import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  ArrowLeft,
  Search,
  MoreVertical,
  Clock,
  CheckCheck,
} from "lucide-react";
import { messagingAPI, type Message, type ConversationData } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import GlobalHeader from "@/components/GlobalHeader";

export default function PatientMessages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = localStorage.getItem("patient_id") || "";
  const userName = localStorage.getItem("user_name") || "Patient";
  const userType = "patient";

  useEffect(() => {
    if (!userId) {
      navigate("/echanneling/login");
      return;
    }
    fetchConversations();
    fetchUnreadCount();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.conversationId, true);
      }
      fetchUnreadCount();
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedConversation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingAPI.getConversations(userId, userType);
      setConversations(data.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, silent = false) => {
    try {
      const data = await messagingAPI.getMessages(conversationId);
      setMessages(data.messages);
      
      // Mark as read
      await messagingAPI.markAsRead(conversationId, userId, userType);
      
      // Update conversation unread count
      setConversations(prev =>
        prev.map(conv =>
          conv.conversationId === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
      fetchUnreadCount();
    } catch (error) {
      if (!silent) {
        console.error("Failed to fetch messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await messagingAPI.getUnreadCount(userId, userType);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleSelectConversation = (conversation: ConversationData) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await messagingAPI.send({
        senderId: userId,
        senderType: userType,
        receiverId: selectedConversation.therapistId,
        receiverType: "therapist",
        content: newMessage.trim(),
        conversationId: selectedConversation.conversationId,
      });

      setNewMessage("");
      fetchMessages(selectedConversation.conversationId, true);
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.therapistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        userName={userName}
        userType={userType}
        unreadCount={unreadCount}
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/echanneling/patient/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Chat with your therapists
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations yet
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                        selectedConversation?.conversationId ===
                        conversation.conversationId
                          ? "bg-accent"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {getInitials(conversation.therapistName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm truncate">
                              {conversation.therapistName}
                            </h3>
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTime(conversation.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="default"
                                className="rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs"
                              >
                                {conversation.unreadCount > 9
                                  ? "9+"
                                  : conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2">
            <CardContent className="p-0 h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {getInitials(selectedConversation.therapistName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {selectedConversation.therapistName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Therapist
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.messageId}
                          className={`flex ${
                            message.senderId === userId
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderId === userId
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                message.senderId === userId
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <span className="text-xs opacity-70">
                                {formatTime(message.createdAt)}
                              </span>
                              {message.senderId === userId && (
                                <CheckCheck
                                  className={`h-3 w-3 ${
                                    message.isRead ? "opacity-100" : "opacity-50"
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex items-end gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">No conversation selected</p>
                    <p className="text-sm">
                      Select a conversation to start messaging
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
