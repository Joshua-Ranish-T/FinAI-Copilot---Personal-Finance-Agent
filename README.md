# FinAI Copilot: Real-Time Financial Assistant

A comprehensive real-time intelligent financial assistant application that serves as an active co-pilot for users to monitor, understand, and optimize all financial debits and credits across multiple sources.

## Features

### Multi-Source Real-Time Data Ingestion
- Connect to open banking APIs, GPay/UPI webhooks, credit card feeds, and wallet platforms
- Real-time transaction processing with cross-platform deduplication

### Contextual Transaction Explanation and Categorization
- Automatic transaction classification (shopping, food, subscription, etc.)
- Merchant details and first-time vendor flagging
- Spending pattern change detection
- RAG-enabled vector index for enriched transaction information

### Proactive Anomaly Detection and Alerts
- Abnormal transaction pattern detection
- Real-time contextual alerts with actionable insights

### Conversational AI Chatbot Interface
- Smart chatbot for transaction queries and spending summaries
- Live, up-to-date, explainable answers powered by LLMs

### Intelligent Nudges and Financial Recommendations
- Personalized spend insights and nudges
- Cost-saving tips based on recurring fees and subscriptions

### Tax, Budget, and Goal Management
- Auto-categorized expenses for tax reporting and budgeting
- Export capabilities for accounting purposes

### Secure API Integration and User Data Protection
- OAuth2-secured integration with financial accounts
- Data encryption in transit and at rest
- Privacy-first design with user-controlled data sharing

## Project Structure

```
├── backend/
│   ├── main.py              # Main application entry point
│   ├── transaction_processor.py # Transaction processing logic
│   ├── anomaly_detector.py  # Anomaly detection system
│   ├── rag_chatbot.py       # RAG-based chatbot implementation
│   ├── api_integration.py   # Financial API connectors
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── # React/Vue frontend components
├── config/
│   └── # Configuration files
└── docs/
    └── # Documentation
```

## Getting Started

### Prerequisites
- Python 3.9+ for the backend
- Node.js 16+ for the frontend
- API keys for OpenAI (for RAG and chatbot features)
- Financial API credentials (for connecting to banking, payment, and wallet services)

### Backend Setup

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Create a virtual environment
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables
   Create a `.env` file in the backend directory with the following:
   ```
   OPENAI_API_KEY=your_openai_api_key
   # Add other API credentials as needed
   ```

6. Run the backend server
   ```bash
   python main.py
   ```

### Frontend Setup (Coming Soon)

## Technology Stack

- **Backend**: Python, Pathway, FastAPI, OpenAI API
- **Real-Time Processing**: Pathway for streaming data pipelines and RAG
- **Security**: OAuth2, Fernet encryption
- **API Integration**: Custom connectors for banking, payment, and wallet APIs
- **AI/ML**: OpenAI embeddings, LLM for chatbot responses

## Security Considerations

- All sensitive data is encrypted both in transit and at rest
- OAuth2 is used for secure authentication with financial institutions
- Access controls and audit logs are maintained
- Users have full control over data sharing and can revoke permissions at any time

## License

[MIT License](LICENSE)

## Acknowledgements

This application leverages cutting-edge technologies from Pathway for real-time data processing and OpenAI for AI-powered insights and chat capabilities.