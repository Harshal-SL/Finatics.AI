# Real-Time Stock Price Integration - Documentation

## 🎯 Overview
The Holdings API now supports **real-time stock prices** from Yahoo Finance API, allowing you to calculate live gain/loss and portfolio valuations.

## 🚀 Features
- ✅ Fetch live stock prices from Yahoo Finance (NSE stocks)
- ✅ Automatic symbol extraction from stock names
- ✅ Real-time calculation of gains/losses and percentages
- ✅ Fallback to database prices if real-time fetch fails
- ✅ Support for multiple stocks in parallel
- ✅ Comprehensive price data (open, high, low, change, etc.)

## 📡 API Usage

### Get Holdings with Real-Time Prices

**Endpoint:**
```
GET /api/holdings/account/:accountNumber?realtime=true
```

**Parameters:**
- `accountNumber` (path): Bank account number
- `realtime` (query): Set to `true` to fetch live prices from Yahoo Finance

**Example Request:**
```bash
# With database prices (default)
GET http://localhost:3000/api/holdings/account/5893143322

# With real-time prices
GET http://localhost:3000/api/holdings/account/5893143322?realtime=true
```

## 📊 Response Structure

### With Real-Time Prices
```json
{
  "success": true,
  "message": "Holdings fetched successfully",
  "realtime": true,
  "data": {
    "customer": {...},
    "bankAccount": {...},
    "holdings": [
      {
        "holding_id": 1,
        "name": "RELIANCE",
        "symbol": "RELIANCE.NS",
        "quantity": 10,
        "bought_price": 1400.00,
        "current_price": 1451.60,
        "price_source": "Yahoo Finance (Live)",
        "real_time_data": {
          "lastPrice": 1451.60,
          "change": 3.20,
          "pChange": 0.22,
          "previousClose": 1448.40,
          "high": 1459.80,
          "low": 1441.00,
          "lastUpdated": "2025-10-24T23:00:22.381Z"
        },
        "investment": 14000.00,
        "currentValue": 14516.00,
        "gainLoss": 516.00,
        "gainLossPercent": 3.69
      }
    ],
    "summary": {
      "totalHoldings": 2,
      "totalValue": 32684.29,
      "totalInvestment": 27625.87,
      "totalGainLoss": 5058.42,
      "totalGainLossPercent": 18.31
    }
  }
}
```

## 🔧 Technical Details

### Stock Service (`nseStockService.js`)
Located at: `BackEnd/services/nseStockService.js`

**Key Functions:**
1. **`extractSymbol(stockName)`** - Extracts Yahoo Finance symbol from stock name
2. **`fetchStockPrice(symbol)`** - Fetches live price for a single stock
3. **`fetchMultipleStockPrices(symbols)`** - Fetches prices for multiple stocks in parallel
4. **`getStockPriceByName(stockName)`** - Convenience method to fetch by name

### Symbol Mapping
The service automatically maps Indian stock names to Yahoo Finance format (adds `.NS` suffix for NSE stocks):

```javascript
'RELIANCE' → 'RELIANCE.NS'
'TCS' → 'TCS.NS'
'TATASTEEL' → 'TATASTEEL.NS'
etc.
```

### Supported Stocks
All NSE-listed stocks are supported via Yahoo Finance. The service includes pre-mapped symbols for popular stocks:
- RELIANCE, TCS, INFY, HDFC, ICICIBANK, SBIN
- TATASTEEL, WIPRO, HINDUNILVR, MARUTI
- TITAN, ITC, LT, AXISBANK, BHARTIARTL
- And many more...

## 📈 Price Calculation Logic

### Real-Time Mode (`?realtime=true`)
1. Extract symbols from holding names
2. Fetch live prices from Yahoo Finance in parallel
3. Calculate metrics using live prices:
   - `investment` = `bought_price` × `quantity`
   - `currentValue` = `live_price` × `quantity`
   - `gainLoss` = `currentValue` - `investment`
   - `gainLossPercent` = (`gainLoss` / `investment`) × 100

### Database Mode (default)
- Uses stored `current_price` from database
- Faster response time
- No external API calls

### Fallback Behavior
If real-time price fetch fails for a stock:
- Falls back to database price
- Sets `price_source` to "database"
- Sets `real_time_data` to `null`
- Continues with other stocks

## 🧪 Testing

### Test Scripts
1. **`test_nse_service.js`** - Tests Yahoo Finance integration
2. **`test_realtime_prices.js`** - Tests full holdings API with real-time prices

### Run Tests
```powershell
# Test Yahoo Finance service
cd BackEnd
node test/test_nse_service.js

# Test full holdings API with real-time prices
node test/test_realtime_prices.js
```

## 📋 Example Test Results

```
Testing RELIANCE stock:
✅ SUCCESS:
   Company: RELIANCE.NS
   Symbol: RELIANCE.NS
   Last Price: ₹1451.6
   Change: ₹3.2 (0.22%)
   Previous Close: ₹1448.4
   Day High: ₹1459.8
   Day Low: ₹1441
   Source: Yahoo Finance
```

## ⚡ Performance

- **Single stock fetch:** ~500-1000ms
- **Multiple stocks (parallel):** ~200ms delay between requests to avoid rate limiting
- **5 stocks:** ~1-2 seconds total
- **Timeout:** 10 seconds per request

## 🔐 Error Handling

The service includes robust error handling:
- Network failures → Falls back to database price
- Invalid symbols → Returns error object with `success: false`
- Timeout → Returns error after 10 seconds
- Rate limiting → 200ms delay between parallel requests

## 💡 Usage Examples

### Frontend Integration
```javascript
// Fetch holdings with real-time prices
const response = await fetch(`/api/holdings/account/${accountNumber}?realtime=true`);
const data = await response.json();

if (data.success) {
  // Display real-time portfolio value
  console.log(`Total Value: ₹${data.data.summary.totalValue}`);
  console.log(`Today's Gain/Loss: ₹${data.data.summary.totalGainLoss}`);
  
  // Display individual holdings
  data.data.holdings.forEach(holding => {
    console.log(`${holding.name}: ₹${holding.current_price}`);
    if (holding.real_time_data) {
      console.log(`  Change today: ${holding.real_time_data.pChange}%`);
    }
  });
}
```

### Refresh Button
```javascript
// Add a refresh button to fetch latest prices
async function refreshPrices() {
  setLoading(true);
  const data = await fetchHoldings(accountNumber, true); // realtime=true
  updatePortfolio(data);
  setLoading(false);
  setLastUpdated(new Date());
}
```

## 🌟 Benefits

1. **Accurate Valuations** - Get current market prices, not stale data
2. **Real-Time P&L** - See exact gains/losses based on current market
3. **Better Decisions** - Make informed decisions with live data
4. **Market Insights** - View day high/low, change%, and more
5. **Automatic Fallback** - Gracefully handles API failures

## 📝 Notes

- Yahoo Finance provides delayed data (15-20 minutes for Indian markets)
- Market hours: Data is most accurate during NSE trading hours (9:15 AM - 3:30 PM IST)
- Rate limiting: Service includes automatic delays to prevent rate limiting
- Free tier: No API key required, completely free to use

## 🔄 Future Enhancements

- [ ] Cache prices for a few minutes to reduce API calls
- [ ] Add websocket support for true real-time updates
- [ ] Support for BSE stocks (add `.BO` suffix)
- [ ] Historical price charts
- [ ] Price alerts and notifications

## 📚 Files Modified/Created

1. **`services/nseStockService.js`** - New stock price service
2. **`controllers/holdingsController.js`** - Updated with realtime support
3. **`test/test_nse_service.js`** - Yahoo Finance service tests
4. **`test/test_realtime_prices.js`** - Full API tests with real-time prices

---

**Last Updated:** October 25, 2025  
**API Version:** 1.0  
**Data Provider:** Yahoo Finance
