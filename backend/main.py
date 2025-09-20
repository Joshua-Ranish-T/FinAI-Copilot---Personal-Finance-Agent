import pathway as pw
import os
import asyncio
import numpy as np
import pathway as pw

# Simple mock KNNIndex class to replace the missing pathway.stdlib.indexing.KNNIndex
class MockKNNIndex:
    def __init__(self, embeddings, n_dimensions=1536):
        self.embeddings = embeddings
        self.n_dimensions = n_dimensions
        # In a real implementation, you would build a proper KNN index here
        
    def search(self, query_embedding, k=5):
        # Simple mock search implementation
        # In a real implementation, this would perform actual KNN search
        results = []
        for text_id, embedding in self.embeddings.items():
            # Mock distance calculation (not real)
            distance = sum(abs(q - e) for q, e in zip(query_embedding, embedding))
            results.append((text_id, distance))
        
        # Sort by distance and return top k results
        results.sort(key=lambda x: x[1])
        return results[:k]

# Simple mock embedder to replace pathway.xpacks.llm.embedders
class MockOpenAIEmbedder:
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key
        self.model = model
        
    def __call__(self, texts, ids):
        # Create mock embeddings with random values
        # In a real implementation, you would call the OpenAI API
        import random
        random.seed(42)  # For reproducibility
        
        # Create a dictionary mapping text to random embeddings
        embeddings = {}
        for text, text_id in zip(texts, ids):
            # Generate a random 1536-dimensional vector (same as OpenAI's ada-002)
            embedding = [random.random() for _ in range(1536)]
            embeddings[text_id] = embedding
            
        # Return a format compatible with KNNIndex
        return embeddings
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import uvicorn
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="FinAI Copilot API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Mock user database (in production, use a real database)
users_db = {
    "user@example.com": {
        "username": "user@example.com",
        "full_name": "Test User",
        "email": "user@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "secret"
        "disabled": False,
    }
}

# Simple mock transaction data for development
mock_transactions = [
    {
        "transaction_id": "tx_123",
        "amount": 25.99,
        "merchant_name": "Starbucks",
        "category": "food",
        "timestamp": "2023-11-01 10:30:00",
        "source_platform": "credit_card",
        "is_anomaly": False,
        "is_duplicate": False
    },
    {
        "transaction_id": "tx_124",
        "amount": 129.99,
        "merchant_name": "Amazon",
        "category": "shopping",
        "timestamp": "2023-11-01 14:45:00",
        "source_platform": "bank",
        "is_anomaly": False,
        "is_duplicate": False
    },
    {
        "transaction_id": "tx_125",
        "amount": 15.99,
        "merchant_name": "Netflix",
        "category": "entertainment",
        "timestamp": "2023-11-02 09:15:00",
        "source_platform": "credit_card",
        "is_anomaly": False,
        "is_duplicate": False
    },
    {
        "transaction_id": "tx_126",
        "amount": 1200.00,
        "merchant_name": "Whole Foods",
        "category": "grocery",
        "timestamp": "2023-11-02 18:30:00",
        "source_platform": "gpay",
        "is_anomaly": True,  # Marked as anomaly for demo
        "is_duplicate": False
    }
]

# Create vector index for RAG-enabled search using our mock embedder
embedder = MockOpenAIEmbedder(
    api_key=os.environ.get("OPENAI_API_KEY", "mock-api-key"),
    model="text-embedding-ada-002"
)

# Create a combined text for embedding and generate mock embeddings
transaction_texts = [f"{tx['merchant_name']} {tx['description'] if 'description' in tx else ''} {tx['category']}" for tx in mock_transactions]
transaction_ids = [tx['transaction_id'] for tx in mock_transactions]

# Create mock embeddings
embedded_text = embedder(transaction_texts, transaction_ids)
vector_index = MockKNNIndex(embedded_text, n_dimensions=1536)  # OpenAI embedding dimension

# Simple mock alerts
mock_alerts = [
    {
        "alert_id": "alert_001",
        "user_id": "user_123",
        "transaction_id": "tx_126",
        "alert_type": "anomaly",
        "message": "Unusual transaction at Whole Foods: $1200.00 (your average is $85.20)",
        "timestamp": "2023-11-02 18:35:00",
        "is_read": False
    }
]

# FastAPI endpoints
def verify_token(token: str = Depends(oauth2_scheme)):
    # Simple token verification (in production, use proper JWT validation)
    if token != "test-token":
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return {"sub": "user@example.com"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Simple login (in production, implement proper authentication)
    user = users_db.get(form_data.username)
    if not user or form_data.password != "secret":
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"access_token": "test-token", "token_type": "bearer"}

@app.get("/transactions")
async def get_transactions(current_user: dict = Depends(verify_token)):
    # In production, query Pathway's live data store
    logger.info(f"Fetching transactions for user: {current_user['sub']}")
    # Return our mock transaction data
    return {
        "transactions": mock_transactions
    }

@app.get("/alerts")
async def get_alerts(current_user: dict = Depends(verify_token)):
    # In production, query Pathway's live data store
    logger.info(f"Fetching alerts for user: {current_user['sub']}")
    # Return our mock alerts
    return {
        "alerts": mock_alerts
    }

@app.post("/chat")
async def chat(message: str, current_user: dict = Depends(verify_token)):
    # In production, use Pathway's RAG to generate responses
    logger.info(f"Chat query from user {current_user['sub']}: {message}")
    
    # Mock response for development
    return {
        "response": f"I'm your financial assistant. You asked: '{message}'. In a production environment, I would use Pathway's RAG to provide you with real-time insights based on your financial data."
    }

@app.get("/insights")
async def get_insights(current_user: dict = Depends(verify_token)):
    # In production, generate insights from Pathway's analysis
    logger.info(f"Generating insights for user: {current_user['sub']}")
    
    # Mock insights for development
    return {
        "insights": [
            "Your coffee spending has increased by 15% this month",
            "Consider reviewing your subscription services - you have 5 active subscriptions",
            "Your average daily spending is $85.20"
        ]
    }

# Start FastAPI server directly (without Pathway)
async def start_application():
    # Start FastAPI server
    config = uvicorn.Config("main:app", host="0.0.0.0", port=8000, reload=True)
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(start_application())