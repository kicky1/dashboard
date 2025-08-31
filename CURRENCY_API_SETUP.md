# Currency API Integration

This app now uses real-time currency exchange rates from the ExchangeRate-API to provide accurate USD to PLN conversions.

## Features

- **Real-time Exchange Rates**: Fetches current USD to PLN rates from ExchangeRate-API
- **Automatic Caching**: Rates are cached for 1 hour to reduce API calls
- **Fallback Support**: Uses cached rates if API is unavailable
- **Language-Based Currency**: Automatically shows USD for English, PLN for Polish
- **Error Handling**: Graceful fallback to cached rates on API failures

## API Details

- **Provider**: [ExchangeRate-API](https://exchangerate-api.com/)
- **Endpoint**: `https://api.exchangerate-api.com/v4/latest/USD`
- **Rate Limit**: Free tier available (no API key required for basic usage)
- **Update Frequency**: Rates are updated daily by the API provider
- **Cache Duration**: 1 hour (configurable in `CurrencyService`)

## How It Works

1. **Initial Load**: App fetches current exchange rates on first load
2. **Language Switch**: When user changes language, currency automatically updates
3. **Real-time Conversion**: All USD amounts are converted to PLN using current rates
4. **Caching**: Rates are cached to avoid excessive API calls
5. **Fallback**: If API fails, cached rates are used as backup

## Usage Examples

### Basic Currency Conversion

```typescript
import { currencyService } from '@/lib/currency';

// Convert USD to PLN
const plnAmount = await currencyService.convertAmount(100, 'USD', 'PLN');

// Format amount for display
const formattedAmount = currencyService.formatAmount(plnAmount, 'PLN');
```

### Force Refresh Rates

```typescript
// Manually refresh exchange rates
await currencyService.forceRefreshRates();
```

### Get Current Rate

```typescript
// Get current USD to PLN rate
const rate = await currencyService.getRate('USD', 'PLN');
console.log(`1 USD = ${rate} PLN`);
```

## Configuration

### Cache Duration

Modify the cache duration in `src/lib/currency.ts`:

```typescript
private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour
```

### API Endpoint

Change the API endpoint if needed:

```typescript
const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
```

### Timeout Settings

Adjust the request timeout:

```typescript
signal: AbortSignal.timeout(10000), // 10 seconds
```

## Error Handling

The service handles various error scenarios:

- **Network Timeouts**: Automatic retry on next attempt
- **API Failures**: Fallback to cached rates
- **Invalid Responses**: Graceful degradation with console warnings
- **Rate Limiting**: Respects API rate limits

## Production Considerations

For production use, consider:

1. **API Key**: Upgrade to paid plan for higher rate limits
2. **Multiple Providers**: Implement fallback APIs for redundancy
3. **Monitoring**: Add logging and monitoring for API health
4. **Rate Limiting**: Implement proper rate limiting on your end
5. **Backup Data**: Store historical rates for offline scenarios

## Testing

Test the currency conversion:

1. Change app language between English and Polish
2. Verify amounts update with correct currency
3. Check console logs for API calls and rate updates
4. Test offline scenarios (should use cached rates)

## Troubleshooting

### Common Issues

1. **Rates not updating**: Check console for API errors
2. **Wrong currency displayed**: Verify language settings
3. **Slow loading**: Check network connectivity and API response times

### Debug Mode

Enable debug logging by checking console output:

- API fetch attempts
- Rate updates
- Cache usage
- Error messages

## Future Enhancements

- [ ] Support for more currencies (EUR, GBP, etc.)
- [ ] Historical rate charts
- [ ] Offline rate storage
- [ ] Multiple API provider support
- [ ] Real-time rate updates via WebSocket
