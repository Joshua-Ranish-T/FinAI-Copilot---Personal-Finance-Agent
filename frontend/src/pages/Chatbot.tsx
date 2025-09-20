import React, { useState, useEffect, useRef } from 'react';
import { Paper, TextField, IconButton, Button, Avatar, Divider, Typography, Tooltip } from '@mui/material';
import { Send, Mic, MicOff, Attachment, MoreVert, Search, Help, X, Info, Warning, AccessTime } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Chatbot.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  isError?: boolean;
  isLoading?: boolean;
  metadata?: {
    transactionId?: string;
    amount?: number;
    merchant?: string;
    category?: string;
    confidence?: number;
    source?: string;
  };
  suggestedActions?: {
    text: string;
    action: () => void;
  }[];
  relatedTransactions?: {
    id: string;
    merchant: string;
    amount: number;
    date: string;
  }[];
}

const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: `Welcome back, ${user.name || 'User'}! I'm your financial assistant. How can I help you today?`,
          sender: 'bot',
          timestamp: new Date(),
          metadata: {
            source: 'system'
          }
        }
      ]);
    }
  }, [user]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setShowSuggestions(false);
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      generateBotResponse(inputValue.trim());
    }, 1000);
  };

  // Generate bot response based on user query
  const generateBotResponse = (userQuery: string) => {
    const queryLower = userQuery.toLowerCase();
    let botMessage: Message;

    // Example responses based on common queries
    if (queryLower.includes('balance') || queryLower.includes('account summary')) {
      botMessage = {
        id: `bot-${Date.now()}`,
        content: 'Here is your account summary as of today:',
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          source: 'balance_check'
        },
        relatedTransactions: [
          {
            id: 'tx-1',
            merchant: 'Main Savings Account',
            amount: 25842.50,
            date: 'Today'
          },
          {
            id: 'tx-2',
            merchant: 'Credit Card Account',
            amount: -8500.00,
            date: 'Today'
          },
          {
            id: 'tx-3',
            merchant: 'Investment Account',
            amount: 42500.75,
            date: 'Today'
          }
        ]
      };
    } else if (queryLower.includes('spent') || queryLower.includes('expenses')) {
      const period = queryLower.includes('month') ? 'this month' : 
                   queryLower.includes('week') ? 'this week' : 
                   'today';
      
      botMessage = {
        id: `bot-${Date.now()}`,
        content: `You've spent ₹12,580 ${period} across various categories. Here's a breakdown:`,
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          source: 'expense_analysis'
        },
        suggestedActions: [
          {
            text: 'View detailed expenses',
            action: () => sendActionMessage('Show detailed expenses')
          },
          {
            text: 'Compare with last month',
            action: () => sendActionMessage('Compare expenses with last month')
          }
        ]
      };
    } else if (queryLower.includes('transaction') || queryLower.includes('spent at')) {
      botMessage = {
        id: `bot-${Date.now()}`,
        content: 'I found the following transactions matching your query:',
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          source: 'transaction_search',
          confidence: 0.95
        },
        relatedTransactions: [
          {
            id: 'tx-101',
            merchant: 'BigMart Electronics',
            amount: 12500.00,
            date: 'Jun 21, 2023'
          },
          {
            id: 'tx-102',
            merchant: 'Uber India',
            amount: 1800.00,
            date: 'Jun 19, 2023'
          },
          {
            id: 'tx-103',
            merchant: 'Green Grocery Mart',
            amount: 2100.00,
            date: 'Jun 18, 2023'
          }
        ]
      };
    } else if (queryLower.includes('anomaly') || queryLower.includes('suspicious') || queryLower.includes('alert')) {
      botMessage = {
        id: `bot-${Date.now()}`,
        content: 'I detected 2 high-severity anomalies in your recent transactions. Would you like to review them?',
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          source: 'anomaly_detection'
        },
        suggestedActions: [
          {
            text: 'Review anomalies',
            action: () => sendActionMessage('Review recent anomalies')
          },
          {
            text: 'Learn about anomaly detection',
            action: () => sendActionMessage('How does anomaly detection work')
          }
        ]
      };
    } else if (queryLower.includes('subscription') || queryLower.includes('recurring')) {
      botMessage = {
        id: `bot-${Date.now()}`,
        content: 'You have 5 active subscriptions totaling ₹2,350 per month. Here are your upcoming charges:',
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          source: 'subscription_tracking'
        },
        relatedTransactions: [
          {
            id: 'sub-1',
            merchant: 'Netflix',
            amount: 599.00,
            date: 'Jun 25, 2023'
          },
          {
            id: 'sub-2',
            merchant: 'Amazon Prime',
            amount: 1299.00,
            date: 'Jun 28, 2023'
          },
          {
            id: 'sub-3',
            merchant: 'Spotify Premium',
            amount: 451.00,
            date: 'Jul 1, 2023'
          }
        ]
      };
    } else if (queryLower.includes('help') || queryLower.includes('guide')) {
      botMessage = {
        id: `bot-${Date.now()}`,
        content: 'I can help you with various financial tasks. Here are some examples of what you can ask me:',
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          source: 'help_guide'
        },
        suggestedActions: [
          {
            text: 'Show my account balance',
            action: () => sendActionMessage('What is my current account balance')
          },
          {
            text: 'Analyze my spending',
            action: () => sendActionMessage('Analyze my spending for this month')
          },
          {
            text: 'Find a transaction',
            action: () => sendActionMessage('Find transaction at BigMart')
          },
          {
            text: 'Show recent alerts',
            action: () => sendActionMessage('Show me recent alerts')
          }
        ]
      };
    } else {
      // Default response
      botMessage = {
        id: `bot-${Date.now()}`,
        content: `I'm here to help you with your financial questions. You can ask me about your account balances, transaction history, spending patterns, or any financial concerns you have.`,
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          source: 'default_response'
        },
        suggestedActions: [
          {
            text: 'What is my account balance?',
            action: () => sendActionMessage('What is my account balance')
          },
          {
            text: 'How much did I spend today?',
            action: () => sendActionMessage('How much did I spend today')
          },
          {
            text: 'Show recent transactions',
            action: () => sendActionMessage('Show my recent transactions')
          }
        ]
      };
    }

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  // Handle action button clicks
  const sendActionMessage = (actionText: string) => {
    const actionMessage: Message = {
      id: `action-${Date.now()}`,
      content: actionText,
      sender: 'user',
      timestamp: new Date(),
      metadata: {
        source: 'action_button'
      }
    };

    setMessages(prev => [...prev, actionMessage]);
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      generateBotResponse(actionText);
    }, 1000);
  };

  // Toggle microphone
  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled);
    // In a real implementation, this would trigger voice recording
  };

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle keyboard events
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`chatbot-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-info">
          <Avatar className="bot-avatar">
            <Help className="avatar-icon" />
          </Avatar>
          <div className="header-details">
            <h2 className="bot-name">Financial Assistant</h2>
            <div className="bot-status">
              <span className="status-indicator online"></span>
              <span className="status-text">Online</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Tooltip title={showSearch ? 'Hide Search' : 'Search Messages'} arrow>
            <IconButton onClick={() => setShowSearch(!showSearch)} className="header-button">
              <Search fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Options" arrow>
            <IconButton className="header-button">
              <MoreVert fontSize="medium" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search fontSize="small" className="search-icon" />
            <input
              type="text"
              placeholder="Search messages..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery('')} className="clear-search">
                <X fontSize="small" />
              </IconButton>
            )}
          </div>
        </div>
      )}

      {/* Message Area */}
      <div className="message-area">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="welcome-message">
            <Paper elevation={0} className="welcome-paper">
              <h3>Welcome to Your Financial Assistant</h3>
              <p>I'm here to help you manage your finances, track your spending, and detect anomalies.</p>
              <Button 
                variant="contained" 
                onClick={() => sendActionMessage('Show me my financial summary')}
                className="welcome-button"
              >
                Get Started
              </Button>
            </Paper>
          </div>
        )}

        {/* Message List */}
        {messages.map((message) => (
          <div key={message.id} className={`message-wrapper ${message.sender}`}>
            {message.sender === 'user' ? (
              // User Message
              <div className="user-message-container">
                <div className="user-message-content">
                  <div className="message-bubble user">
                    <p className="message-text">{message.content}</p>
                  </div>
                  <div className="message-meta user">
                    <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Bot/System Message
              <div className="bot-message-container">
                <Avatar className="bot-avatar small">
                  <Help className="avatar-icon small" />
                </Avatar>
                <div className="bot-message-content">
                  <div className={`message-bubble bot ${message.isError ? 'error' : ''}`}>
                    <p className="message-text">{message.content}</p>
                    
                    {/* Related Transactions */}
                    {message.relatedTransactions && message.relatedTransactions.length > 0 && (
                      <div className="related-transactions">
                        <div className="related-transactions-header">
                          <h4 className="related-title">Related Transactions</h4>
                        </div>
                        <div className="transactions-list">
                          {message.relatedTransactions.map((transaction) => (
                            <div key={transaction.id} className="transaction-item">
                              <div className="transaction-info">
                                <span className="transaction-merchant">{transaction.merchant}</span>
                                <span className="transaction-date">{transaction.date}</span>
                              </div>
                              <span className={`transaction-amount ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bot Metadata */}
                    {message.metadata && message.metadata.source && (
                      <div className="message-metadata">
                        <Tooltip title={`Source: ${message.metadata.source}`} arrow>
                          <Info fontSize="small" className="metadata-icon" />
                        </Tooltip>
                        {message.metadata.confidence && (
                          <span className="confidence-score">
                            Confidence: {Math.round(message.metadata.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Suggested Actions */}
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="suggested-actions">
                      {message.suggestedActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          className="suggested-action-button"
                          onClick={action.action}
                        >
                          {action.text}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="message-meta bot">
                    <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="typing-indicator">
            <Avatar className="bot-avatar small">
              <Help className="avatar-icon small" />
            </Avatar>
            <div className="typing-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}

        {/* End of Messages Marker */}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {showSuggestions && messages.length > 0 && !isTyping && (
        <div className="suggested-questions">
          <p className="suggestions-label">Try asking:</p>
          <div className="questions-container">
            <Button
              variant="outlined"
              size="small"
              className="suggested-question"
              onClick={() => sendActionMessage('What is my current account balance?')}
            >
              What is my current account balance?
            </Button>
            <Button
              variant="outlined"
              size="small"
              className="suggested-question"
              onClick={() => sendActionMessage('How much did I spend this month?')}
            >
              How much did I spend this month?
            </Button>
            <Button
              variant="outlined"
              size="small"
              className="suggested-question"
              onClick={() => sendActionMessage('Show me recent alerts')}
            >
              Show me recent alerts
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area" ref={inputRef}>
        <div className="input-container">
          <IconButton onClick={toggleMic} className={`mic-button ${isMicEnabled ? 'active' : ''}`}>
            {isMicEnabled ? <MicOff fontSize="medium" /> : <Mic fontSize="medium" />}
          </IconButton>
          <TextField
            variant="outlined"
            placeholder="Type your message here..."
            multiline
            rows={3}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="message-input"
            InputProps={{
              disableUnderline: true,
              className: 'input-field'
            }}
          />
          <IconButton className="attachment-button">
            <Attachment fontSize="medium" />
          </IconButton>
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`send-button ${inputValue.trim() ? 'active' : ''}`}
          >
            <Send fontSize="medium" />
          </IconButton>
        </div>
      </div>

      {/* Help Button */}
      <Tooltip title="Help" arrow>
        <div className="help-button">
          <IconButton className="floating-help">
            <Help fontSize="large" />
          </IconButton>
        </div>
      </Tooltip>
    </div>
  );
};

export default Chatbot;