import pathway as pw
from pathway.stdlib.indexing import KNNIndex
from pathway.xpacks.llm import embedders, llms
import os
import logging
import json
import re

logger = logging.getLogger(__name__)

class FinancialRAGChatbot:
    """Implements a RAG-based chatbot for financial queries"""
    
    def __init__(self, openai_api_key=None):
        self.api_key = openai_api_key or os.environ.get("OPENAI_API_KEY", "mock-api-key")
        self.embedder = None
        self.vector_index = None
        self.llm = None
        
        # Initialize components
        self._initialize_embedder()
        self._initialize_llm()
    
    def _initialize_embedder(self):
        """Initialize the text embedder"""
        try:
            self.embedder = embedders.OpenAIEmbedder(
                api_key=self.api_key,
                model="text-embedding-ada-002"
            )
        except Exception as e:
            logger.error(f"Failed to initialize embedder: {e}")
            # Fallback to mock embedder if real one fails
            self.embedder = self._create_mock_embedder()
    
    def _initialize_llm(self):
        """Initialize the LLM for generating responses"""
        try:
            self.llm = llms.OpenAI(
                api_key=self.api_key,
                model="gpt-3.5-turbo",
                temperature=0.7
            )
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")
            # Use mock LLM responses
            self.llm = self._create_mock_llm()
    
    def _create_mock_embedder(self):
        """Create a mock embedder for testing"""
        def mock_embed(text, id=None):
            # Generate simple mock embeddings
            import numpy as np
            embeddings = [np.random.rand(1536).tolist() for _ in text]
            result = pw.record({"id": id, "embedding": embeddings})
            return result
        
        return mock_embed
    
    def _create_mock_llm(self):
        """Create a mock LLM for testing"""
        def mock_generate(prompt, **kwargs):
            # Generate simple mock responses
            responses = []
            for p in prompt:
                if "transaction" in p.lower():
                    responses.append("I can help you with transaction-related questions. Please specify which transaction you're inquiring about.")
                elif "spending" in p.lower() or "budget" in p.lower():
                    responses.append("Your recent spending shows you've spent $250 on food this week, which is 15% more than last week.")
                elif "alert" in p.lower() or "anomaly" in p.lower():
                    responses.append("There are currently no active alerts on your account. Your finances appear to be in good order.")
                else:
                    responses.append("I'm your financial assistant. How can I help you with your finances today?")
            
            return responses
        
        return mock_generate
    
    def setup_vector_index(self, transactions):
        """Set up the vector index for RAG"""
        # Create combined text for embedding
        combined_text = transactions.select(
            pw.this.transaction_id,
            text=pw.this.merchant_name + " " + pw.this.description + " " + 
                 pw.this.category + " " + str(pw.this.amount) + " " + 
                 pw.this.timestamp + " " + pw.this.source_platform
        )
        
        # Create embeddings
        embedded_text = self.embedder(combined_text.text, combined_text.transaction_id)
        
        # Create vector index
        self.vector_index = KNNIndex(embedded_text, n_dimensions=1536)
        
        return self.vector_index
    
    def generate_prompt(self, query, context_docs):
        """Generate a prompt for the LLM with context"""
        context_str = "\n".join([f"Transaction: {doc}" for doc in context_docs])
        
        prompt = f"""You are a financial assistant. Answer the user's question based on the provided transaction context.\n\n"
        prompt += f"Context:\n{context_str}\n\n"
        prompt += f"User Question: {query}\n\n"
        prompt += f"Answer in a helpful, conversational tone. If you don't have enough information to answer accurately, say so." """
        
        return prompt
    
    def answer_query(self, query, vector_index=None):
        """Answer a user query using RAG"""
        logger.info(f"Processing user query: {query}")
        
        # Use the provided vector index or the instance's index
        index_to_use = vector_index or self.vector_index
        
        if not index_to_use:
            # If no vector index is available, use LLM without context
            prompt = f"You are a financial assistant. Answer the user's question: {query}"
            response = self.llm([prompt])[0]
            return response
        
        try:
            # Embed the query
            query_embedding = self.embedder([query], ["query_embedding"])
            
            # Search for relevant documents
            search_results = index_to_use.search(query_embedding.embedding[0], k=5)
            
            # Extract relevant context
            context_docs = []
            for result in search_results:
                # In production, you would get the actual document content
                # For this simplified version, we'll create a mock context
                context_docs.append(f"Mock transaction data matching query: {query}")
            
            # Generate prompt with context
            prompt = self.generate_prompt(query, context_docs)
            
            # Get response from LLM
            response = self.llm([prompt])[0]
            
            return response
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            # Fallback response
            return "I apologize, but I'm having trouble processing your request at the moment. Please try again later."

# Pathway-based RAG functions
def build_rag_system(transactions):
    """Build a complete RAG system using Pathway"""
    # Initialize chatbot
    chatbot = FinancialRAGChatbot()
    
    # Set up vector index
    vector_index = chatbot.setup_vector_index(transactions)
    
    return chatbot, vector_index

def process_chat_query(query, chatbot, vector_index):
    """Process a chat query using the RAG system"""
    return chatbot.answer_query(query, vector_index)

# Financial query intent classification
def classify_query_intent(query):
    """Classify the intent of a user's financial query"""
    intent_patterns = {
        "transaction_detail": [
            r"what was that", r"explain transaction", r"show details",
            r"what is this charge", r"what is this payment", r"who is",
            r"merchant details"
        ],
        "spending_summary": [
            r"how much did I spend", r"spending summary", r"monthly spending",
            r"weekly expenses", r"total spent", r"expense report",
            r"spending by category"
        ],
        "budget_status": [
            r"budget", r"how am I doing", r"over budget", r"under budget",
            r"budget status", r"remaining budget"
        ],
        "anomaly_inquiry": [
            r"alert", r"anomaly", r"suspicious", r"unusual", r"flagged",
            r"why was this flagged", r"what's wrong with this transaction"
        ],
        "subscription_management": [
            r"subscription", r"subscriptions", r"recurring payments",
            r"cancel subscription", r"list my subscriptions", r"ongoing payments"
        ],
        "financial_advice": [
            r"advice", r"recommend", r"should I", r"how to save",
            r"save money", r"financial tips", r"budgeting tips"
        ],
        "account_balance": [
            r"balance", r"how much do I have", r"available funds",
            r"account summary", r"current balance"
        ]
    }
    
    query_lower = query.lower()
    
    # Check for intent patterns
    for intent, patterns in intent_patterns.items():
        for pattern in patterns:
            if re.search(pattern, query_lower):
                return intent
    
    # Default intent
    return "general_inquiry"

def generate_contextual_response(query, context_data):
    """Generate a contextual response based on query intent and data"""
    intent = classify_query_intent(query)
    
    # Generate responses based on intent
    if intent == "transaction_detail":
        # Extract merchant name from query if possible
        merchant_match = re.search(r"who is ([\w\s]+)", query.lower())
        if merchant_match and context_data.get("transactions"):
            merchant_name = merchant_match.group(1)
            # Find transactions matching the merchant
            matching_transactions = [t for t in context_data["transactions"] 
                                   if merchant_name.lower() in t.get("merchant_name", "").lower()]
            if matching_transactions:
                latest_transaction = matching_transactions[0]
                return f"{latest_transaction.get('merchant_name')} is a {latest_transaction.get('category')} merchant. You spent ${latest_transaction.get('amount', 0):.2f} on {latest_transaction.get('timestamp', '')}."
        return "I can help you with transaction details. Please provide more information about the specific transaction."
        
    elif intent == "spending_summary":
        if context_data.get("spending_summary"):
            summary = context_data["spending_summary"]
            return f"Your total spending this month is ${summary.get('total', 0):.2f}. You've spent the most on {summary.get('top_category', 'shopping')}."
        return "I don't have your spending summary available right now. Please try again later."
        
    elif intent == "budget_status":
        if context_data.get("budget"):
            budget = context_data["budget"]
            return f"You're currently {budget.get('status', 'on track')} with your budget. You have ${budget.get('remaining', 0):.2f} remaining for this month."
        return "I don't have your budget information available right now."
        
    elif intent == "anomaly_inquiry":
        if context_data.get("alerts") and context_data["alerts"]:
            latest_alert = context_data["alerts"][0]
            return f"We detected {latest_alert.get('alert_type')}: {latest_alert.get('message')}"
        return "You currently have no active alerts on your account."
        
    elif intent == "subscription_management":
        if context_data.get("subscriptions"):
            subs = context_data["subscriptions"]
            if subs:
                sub_list = ", ".join([f"{s.get('merchant_name')} (${s.get('avg_amount', 0):.2f})"] for s in subs[:3])
                return f"You have {len(subs)} active subscriptions including {sub_list}."
        return "I don't have information about your subscriptions right now."
        
    elif intent == "financial_advice":
        return "Based on your spending patterns, I recommend reviewing your subscriptions and setting a weekly food budget to save more effectively."
        
    elif intent == "account_balance":
        if context_data.get("balance"):
            return f"Your current account balance is ${context_data['balance']:.2f}."
        return "I don't have your current balance information available."
        
    else:
        # General inquiry
        return "I'm your financial assistant. How can I help you with your finances today?"