import pathway as pw
import numpy as np
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AnomalyDetector:
    """Implements real-time anomaly detection for financial transactions"""
    
    def __init__(self):
        # Configure detection thresholds and parameters
        self.amount_threshold_multiplier = 3.0  # 3 standard deviations
        self.time_pattern_threshold = 0.05  # 5% probability
        self.new_location_threshold = 0.1  # 10% confidence for new location
    
    def detect_amount_anomalies(self, transaction, merchant_stats):
        """Detect anomalies based on transaction amount compared to historical data"""
        if not merchant_stats or 'avg_amount' not in merchant_stats:
            return False, None
        
        avg_amount = merchant_stats['avg_amount']
        std_amount = merchant_stats.get('std_amount', avg_amount * 0.2)  # Default to 20% if no std
        current_amount = transaction.get('amount', 0)
        merchant_name = transaction.get('merchant_name', 'Unknown')
        
        # Calculate Z-score
        if std_amount > 0:
            z_score = abs(current_amount - avg_amount) / std_amount
            is_anomaly = z_score > self.amount_threshold_multiplier
        else:
            # If there's no variation, use simple ratio comparison
            ratio = current_amount / avg_amount if avg_amount > 0 else 0
            is_anomaly = ratio > 3.0  # More than 3x the average
        
        if is_anomaly:
            message = f"Unusual transaction at {merchant_name}: ${current_amount:.2f} (your average is ${avg_amount:.2f})"
            return True, message
        
        return False, None
    
    def detect_time_pattern_anomalies(self, transaction, time_patterns):
        """Detect anomalies based on transaction time patterns"""
        if not time_patterns:
            return False, None
        
        transaction_time = datetime.strptime(transaction.get('timestamp', ''), '%Y-%m-%d %H:%M:%S')
        hour_of_day = transaction_time.hour
        day_of_week = transaction_time.weekday()
        merchant_name = transaction.get('merchant_name', 'Unknown')
        
        # Check if this time is unusual for this merchant
        # In production, this would use a more sophisticated time pattern model
        # For this simplified version, we'll assume time_patterns contains probability data
        time_key = f"{merchant_name}_{day_of_week}_{hour_of_day}"
        probability = time_patterns.get(time_key, 0.5)  # Default to 50% if no data
        
        if probability < self.time_pattern_threshold:
            message = f"Transaction at unusual time for {merchant_name} (rare for {transaction_time.strftime('%A %I:%M %p')})"
            return True, message
        
        return False, None
    
    def detect_new_merchant_anomalies(self, transaction, user_history):
        """Flag transactions with new merchants"""
        merchant_name = transaction.get('merchant_name', '')
        
        # Check if this merchant appears in user history
        for hist_transaction in user_history:
            if hist_transaction.get('merchant_name') == merchant_name:
                return False, None
        
        # This is a new merchant for the user
        message = f"First-time transaction with {merchant_name}"
        return True, message
    
    def detect_geocontext_anomalies(self, transaction, user_location_history):
        """Detect transactions that occur in unusual geographic locations"""
        # In production, this would integrate with geolocation data
        # For now, we'll use mock implementation
        transaction_location = transaction.get('location', None)
        
        if not transaction_location or not user_location_history:
            return False, None
        
        # Simple check if location is in user's usual locations
        if transaction_location not in user_location_history:
            message = f"Transaction in unusual location: {transaction_location}"
            return True, message
        
        return False, None

# Pathway-based anomaly detection functions
def build_merchant_statistics(transactions):
    """Build merchant statistics using Pathway"""
    merchant_groups = transactions.groupby(transactions.merchant_name)
    merchant_stats = merchant_groups.reduce(
        merchant_name=merchant_groups.merchant_name,
        avg_amount=pw.reducers.avg(merchant_groups.amount),
        std_amount=pw.reducers.std(merchant_groups.amount),
        median_amount=pw.reducers.median(merchant_groups.amount),
        count=pw.reducers.count()
    )
    
    return merchant_stats

def build_time_patterns(transactions):
    """Build time-based patterns using Pathway"""
    # Extract time components
    time_enriched = transactions.select(
        **transactions,
        timestamp_dt=pw.apply(
            transactions.timestamp,
            lambda ts: datetime.strptime(ts, '%Y-%m-%d %H:%M:%S')
        ),
        hour=pw.apply(
            transactions.timestamp,
            lambda ts: datetime.strptime(ts, '%Y-%m-%d %H:%M:%S').hour
        ),
        day_of_week=pw.apply(
            transactions.timestamp,
            lambda ts: datetime.strptime(ts, '%Y-%m-%d %H:%M:%S').weekday()
        )
    )
    
    # Group by merchant, day of week, and hour
    time_groups = time_enriched.groupby(
        time_enriched.merchant_name, 
        time_enriched.day_of_week, 
        time_enriched.hour
    )
    
    # Calculate counts for each time pattern
    time_patterns = time_groups.reduce(
        merchant_name=time_groups.merchant_name,
        day_of_week=time_groups.day_of_week,
        hour=time_groups.hour,
        count=pw.reducers.count()
    )
    
    # In production, we would calculate probabilities here
    # For this simplified version, we'll just return the counts
    return time_patterns

def detect_anomalies(transactions):
    """Main function to detect anomalies in transactions"""
    # Build merchant statistics
    merchant_stats = build_merchant_statistics(transactions)
    
    # Join transactions with their merchant statistics
    enriched_transactions = transactions.join(
        merchant_stats,
        transactions.merchant_name == merchant_stats.merchant_name,
        how="left"
    )
    
    # Create anomaly detector instance
    detector = AnomalyDetector()
    
    # Detect amount anomalies
    amount_anomalies = enriched_transactions.select(
        **enriched_transactions,
        is_amount_anomaly=pw.apply(
            enriched_transactions.amount, 
            enriched_transactions.avg_amount, 
            enriched_transactions.std_amount,
            lambda amt, avg, std: abs(amt - avg) > 3 * std if avg is not None and std is not None else False
        ),
        amount_anomaly_message=pw.apply(
            enriched_transactions.merchant_name, 
            enriched_transactions.amount, 
            enriched_transactions.avg_amount,
            lambda merchant, amt, avg: f"Unusual transaction at {merchant}: ${amt:.2f} (your average is ${avg:.2f})" if avg is not None else None
        )
    )
    
    # Combine all anomaly types (in this simplified version, we just have amount anomalies)
    all_anomalies = amount_anomalies.select(
        **amount_anomalies,
        is_anomaly=amount_anomalies.is_amount_anomaly,
        anomaly_message=amount_anomaly_message
    )
    
    # Filter to get only anomalies
    anomalies = all_anomalies.filter(all_anomalies.is_anomaly)
    
    return anomalies

def generate_alerts(anomalies, user_id):
    """Generate alerts for detected anomalies"""
    alerts = anomalies.select(
        alert_id=pw.hash(anomalies.transaction_id + pw.now().to_string()),
        user_id=user_id,
        transaction_id=anomalies.transaction_id,
        alert_type="anomaly",
        message=anomalies.anomaly_message,
        timestamp=pw.now().to_string(),
        severity=pw.apply(
            anomalies.amount, anomalies.avg_amount,
            lambda amt, avg: "high" if avg is not None and amt > 5 * avg else "medium" if avg is not None and amt > 3 * avg else "low"
        ),
        is_read=False
    )
    
    return alerts

def detect_pattern_changes(transactions, window_size=30):
    """Detect changes in spending patterns over time"""
    # Add date component for time-based windowing
    dated_transactions = transactions.select(
        **transactions,
        date=pw.apply(
            transactions.timestamp,
            lambda ts: datetime.strptime(ts, '%Y-%m-%d %H:%M:%S').date()
        )
    )
    
    # Group by category and date for trend analysis
    category_daily = dated_transactions.groupby(
        dated_transactions.category, 
        dated_transactions.date
    ).reduce(
        category=dated_transactions.category,
        date=dated_transactions.date,
        daily_amount=pw.reducers.sum(dated_transactions.amount),
        transaction_count=pw.reducers.count()
    )
    
    # In a production environment, we would implement more sophisticated
    # time series analysis here to detect trends and pattern changes
    # For this simplified version, we'll just return the daily category totals
    return category_daily

def create_alert_rules(rule_config=None):
    """Create and manage alert rules"""
    # Default alert rules if none provided
    default_rules = [
        {
            "rule_id": "high_amount",
            "name": "High Amount Transaction",
            "condition": "amount > 1000",
            "severity": "high",
            "enabled": True
        },
        {
            "rule_id": "unusual_pattern",
            "name": "Unusual Spending Pattern",
            "condition": "z_score > 3",
            "severity": "medium",
            "enabled": True
        },
        {
            "rule_id": "new_merchant",
            "name": "First-time Merchant",
            "condition": "is_new_merchant",
            "severity": "low",
            "enabled": True
        },
        {
            "rule_id": "duplicate_transaction",
            "name": "Potential Duplicate Transaction",
            "condition": "is_duplicate",
            "severity": "medium",
            "enabled": True
        }
    ]
    
    return rule_config if rule_config else default_rules