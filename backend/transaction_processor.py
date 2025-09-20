import pathway as pw
import re
import json
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Transaction categorization logic
CATEGORY_PATTERNS = {
    "shopping": [
        r"amazon", r"walmart", r"target", r"best buy", r"ebay", r"shopify",
        r"zappos", r"nike", r"adidas", r"uniqlo", r"hm", r"macy'\''s",
        r"costco", r"aldi", r"kroger", r"walgreens", r"cvs"
    ],
    "food": [
        r"starbucks", r"mcdonald'\''s", r"burger king", r"wendy'\''s", r"subway",
        r"domino'\''s", r"pizza hut", r"chipotle", r"panera", r"olive garden",
        r"taco bell", r"dunkin", r"seamless", r"doordash", r"uber eats", r"grubhub"
    ],
    "transportation": [
        r"uber", r"lyft", r"lyft", r"taxi", r"metro", r"subway", r"bus",
        r"train", r"airline", r"flight", r"delta", r"united", r"american airlines",
        r"southwest", r"gas", r"petrol", r"shell", r"bp", r"chevron"
    ],
    "entertainment": [
        r"netflix", r"spotify", r"hulu", r"disney+", r"hbo max", r"prime video",
        r"apple music", r"youtube", r"movie", r"cinema", r"theater", r"concert",
        r"ticketmaster", r"live nation", r"game", r"xbox", r"playstation", r"nintendo"
    ],
    "utilities": [
        r"electric", r"power", r"gas bill", r"water", r"internet", r"wifi",
        r"phone", r"mobile", r"cell", r"telecom", r"cable", r"tv", r"utility"
    ],
    "housing": [
        r"rent", r"mortgage", r"property", r"apartment", r"condo", r"house",
        r"homeowners", r"hoa", r"insurance", r"property tax"
    ],
    "healthcare": [
        r"doctor", r"hospital", r"clinic", r"pharmacy", r"medication", r"medicine",
        r"health", r"dental", r"vision", r"insurance", r"copay", r"deductible"
    ],
    "education": [
        r"tuition", r"school", r"college", r"university", r"book", r"textbook",
        r"course", r"class", r"education", r"training"
    ],
    "finance": [
        r"bank", r"transfer", r"deposit", r"withdrawal", r"atm", r"fee",
        r"interest", r"loan", r"credit card", r"payment", r"refund", r"reimbursement",
        r"tax", r"irs", r"investment", r"stock", r"bond", r"mutual fund"
    ],
    "subscription": [
        r"netflix", r"spotify", r"amazon prime", r"microsoft 365", r"adobe",
        r"dropbox", r"google one", r"icloud", r"apple one", r"youtube premium",
        r"pandora", r"tidal", r"fitness", r"gym", r"membership", r"subscription"
    ]
}

class TransactionProcessor:
    """Handles advanced transaction processing logic"""
    
    def __init__(self):
        # Initialize any necessary models or services
        pass
    
    def categorize_transaction(self, merchant_name, description):
        """Automatically categorize a transaction based on merchant name and description"""
        text = (merchant_name + " " + description).lower()
        
        # Check for exact matches first
        for category, patterns in CATEGORY_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return category
        
        # Default category
        return "uncategorized"
    
    def explain_transaction(self, transaction):
        """Generate a human-readable explanation for a transaction"""
        merchant_name = transaction.get("merchant_name", "Unknown Merchant")
        amount = transaction.get("amount", 0)
        category = transaction.get("category", "uncategorized")
        source_platform = transaction.get("source_platform", "Unknown Platform")
        
        explanation = f"${amount:.2f} spent at {merchant_name} ({category}) via {source_platform}"
        
        # Add additional context based on transaction details
        if transaction.get("is_first_time_vendor", False):
            explanation += " - First time transaction with this merchant"
        
        if transaction.get("is_anomaly", False):
            avg_amount = transaction.get("avg_merchant_amount", 0)
            explanation += f" - Unusual amount (your average is ${avg_amount:.2f})"
        
        if transaction.get("is_duplicate", False):
            explanation += " - Potential duplicate transaction"
        
        return explanation
    
    def detect_pattern_changes(self, current_transaction, historical_data):
        """Detect changes in spending patterns compared to historical data"""
        merchant_name = current_transaction.get("merchant_name", "")
        current_amount = current_transaction.get("amount", 0)
        
        # Filter historical data for the same merchant
        merchant_history = [t for t in historical_data if t.get("merchant_name") == merchant_name]
        
        if not merchant_history:
            return None, False
        
        # Calculate average and maximum historical amounts
        avg_amount = sum(t.get("amount", 0) for t in merchant_history) / len(merchant_history)
        max_amount = max(t.get("amount", 0) for t in merchant_history)
        
        # Check for significant deviations
        deviation_threshold = 2.0  # 2x the average
        is_pattern_change = current_amount > deviation_threshold * avg_amount
        
        if is_pattern_change:
            pattern_change_text = f"{current_amount/avg_amount:.1f}x your usual spend at {merchant_name}"
            return pattern_change_text, True
        
        return None, False
    
    def enrich_with_external_data(self, transaction):
        """Enrich transaction with external data like merchant reputation, news, etc."""
        # In production, this would integrate with external APIs
        # For now, we'll add mock data
        enriched_transaction = transaction.copy()
        
        # Add mock merchant information
        enriched_transaction["merchant_info"] = {
            "reputation_score": 4.7,  # Mock score out of 5
            "is_verified": True,
            "industry": "Retail",
            "has_fraud_reports": False
        }
        
        # Add mock social sentiment
        enriched_transaction["sentiment"] = {
            "score": 0.8,  # Mock positive score
            "label": "positive"
        }
        
        # Add mock news context
        enriched_transaction["news_context"] = None
        
        return enriched_transaction
    
    def flag_first_time_vendors(self, transaction, user_transaction_history):
        """Identify if this is the first time the user is transacting with this merchant"""
        merchant_name = transaction.get("merchant_name", "")
        
        # Check if merchant exists in user's transaction history
        for hist_transaction in user_transaction_history:
            if hist_transaction.get("merchant_name") == merchant_name:
                return False
        
        return True

# Pathway-based transaction processing functions
def process_transactions(transactions):
    """Process transactions using Pathway operations"""
    processor = TransactionProcessor()
    
    # Categorize transactions
    categorized = transactions.select(
        **transactions,
        category=pw.apply(
            transactions.merchant_name, transactions.description,
            processor.categorize_transaction
        )
    )
    
    # Add human-readable explanation
    explained = categorized.select(
        **categorized,
        human_explanation=pw.apply(
            categorized,
            lambda t: processor.explain_transaction({
                "merchant_name": t.merchant_name,
                "amount": t.amount,
                "category": t.category,
                "source_platform": t.source_platform,
                "is_anomaly": t.is_anomaly,
                "avg_merchant_amount": getattr(t, "avg_merchant_amount", 0),
                "is_duplicate": t.is_duplicate
            })
        )
    )
    
    # In production, we would implement more complex operations here
    # such as joining with historical data, etc.
    
    return explained

# More advanced Pathway processing functions
def aggregate_spending_by_category(transactions):
    """Aggregate spending by category"""
    return transactions.groupby(transactions.category).reduce(
        category=transactions.category,
        total_amount=pw.reducers.sum(transactions.amount),
        transaction_count=pw.reducers.count()
    )

def identify_recurring_subscriptions(transactions):
    """Identify recurring subscription payments"""
    # Group by merchant and calculate payment frequency
    merchant_groups = transactions.filter(
        transactions.transaction_type == "debit"
    ).groupby(
        transactions.merchant_name
    )
    
    # Calculate statistics for each merchant
    merchant_stats = merchant_groups.reduce(
        merchant_name=merchant_groups.merchant_name,
        avg_amount=pw.reducers.avg(merchant_groups.amount),
        std_amount=pw.reducers.std(merchant_groups.amount),
        transaction_count=pw.reducers.count(),
        # In a real implementation, we would calculate time intervals between transactions
        # to determine recurrence patterns
    )
    
    # Identify potential subscriptions based on transaction count and amount consistency
    # This is a simplified version - in production, you'd use time interval analysis
    subscriptions = merchant_stats.filter(
        (merchant_stats.transaction_count >= 2) & 
        (merchant_stats.std_amount < 0.1 * merchant_stats.avg_amount)  # Amounts are consistent
    ).select(
        merchant_name=merchant_stats.merchant_name,
        avg_amount=merchant_stats.avg_amount,
        transaction_count=merchant_stats.transaction_count,
        is_likely_subscription=True
    )
    
    return subscriptions

def detect_high_value_transactions(transactions, threshold=1000):
    """Detect high-value transactions based on a threshold"""
    return transactions.filter(
        (transactions.transaction_type == "debit") & 
        (transactions.amount > threshold)
    ).select(
        **transactions,
        is_high_value=True
    )

def calculate_spending_insights(transactions):
    """Calculate various spending insights"""
    # Total spending
    total_spending = transactions.filter(
        transactions.transaction_type == "debit"
    ).reduce(
        total_spending=pw.reducers.sum(transactions.amount)
    )
    
    # Total income
    total_income = transactions.filter(
        transactions.transaction_type == "credit"
    ).reduce(
        total_income=pw.reducers.sum(transactions.amount)
    )
    
    # Top merchants by spending
    top_merchants = transactions.filter(
        transactions.transaction_type == "debit"
    ).groupby(
        transactions.merchant_name
    ).reduce(
        merchant_name=transactions.merchant_name,
        total_spent=pw.reducers.sum(transactions.amount)
    ).orderby(
        pw.desc(pw.this.total_spent)
    ).limit(5)
    
    # Spending by platform
    spending_by_platform = transactions.filter(
        transactions.transaction_type == "debit"
    ).groupby(
        transactions.source_platform
    ).reduce(
        platform=transactions.source_platform,
        total_spent=pw.reducers.sum(transactions.amount)
    )
    
    # In production, we would return all these insights together
    # For this simplified version, we'll just return the top merchants
    return top_merchants