# Supabase Analytics Setup Guide

## Project Details
- **Project URL**: `https://absdasswruhhtaguenfz.supabase.co`
- **Anon Key (Publishable)**: `sb_publishable_lFCNrDCe3nuIHIpShJwjtA_CFLRjUvN`
- **Table Name**: `tap_logs`

These credentials are already pre-configured in `spraakhelper-v2.html`.

---

## Step 1: Create the Analytics Table

Go to your Supabase dashboard and run this SQL in the **SQL Editor**:

```sql
CREATE TABLE tap_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  timestamp TEXT NOT NULL,
  deviceId TEXT NOT NULL,
  source TEXT,
  categoryPath TEXT[],
  itemLabel TEXT,
  itemId TEXT,
  itemEmoji TEXT,
  itemSay TEXT,
  currentTheme TEXT,
  actionType TEXT,
  time_to_tap_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tap_logs_device ON tap_logs(deviceId);
CREATE INDEX idx_tap_logs_timestamp ON tap_logs(timestamp);
CREATE INDEX idx_tap_logs_source ON tap_logs(source);
```

---

## Step 2: Enable Row Level Security (RLS)

For basic access control:

```sql
-- Enable RLS on tap_logs table
ALTER TABLE tap_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT logs (for the app)
CREATE POLICY "Allow anonymous insert" ON tap_logs
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to SELECT all logs (for analytics)
CREATE POLICY "Allow authenticated select" ON tap_logs
  FOR SELECT
  TO authenticated
  USING (true);
```

---

## Step 3: Run Your App

1. Open `spraakhelper-v2.html` in a browser
2. Click **📁 Exporteer logs** to upload tap logs
3. Check Supabase dashboard → **tap_logs** table to see data flowing in

---

## Step 4: Analytics Queries

View your analytics in Supabase SQL Editor:

### Most tapped categories
```sql
SELECT 
  itemLabel, 
  COUNT(*) as tap_count,
  COUNT(DISTINCT deviceId) as unique_devices
FROM tap_logs
WHERE source = 'grid'
GROUP BY itemLabel
ORDER BY tap_count DESC
LIMIT 20;
```

### Users spending most time searching
```sql
SELECT 
  deviceId,
  COUNT(*) as total_taps,
  AVG(time_to_tap_ms)::INT as avg_search_time_ms,
  MAX(time_to_tap_ms) as max_search_time_ms
FROM tap_logs
WHERE actionType = 'folder'
GROUP BY deviceId
ORDER BY avg_search_time_ms DESC;
```

### Category usage heatmap
```sql
SELECT 
  categoryPath[1] as top_category,
  COUNT(*) as usage_count,
  COUNT(DISTINCT deviceId) as unique_users
FROM tap_logs
WHERE source = 'grid' AND actionType = 'leaf'
GROUP BY categoryPath[1]
ORDER BY usage_count DESC;
```

### Device activity over time
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as daily_taps,
  COUNT(DISTINCT deviceId) as active_devices
FROM tap_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

---

## Troubleshooting

### "apikey" header issue
- Make sure you're using the **Anon Public Key** (starts with `sb_publishable_`)
- Not the Full Access key

### CORS errors
- Supabase REST API should allow cross-origin requests by default
- If blocked, check Supabase dashboard → **Settings** → **API** → CORS policy

### "Table not found" error
- Verify table name is exactly `tap_logs` (case-sensitive)
- Run the CREATE TABLE SQL query first

---

## API Reference: Tap Log Schema

Each tap records:

```json
{
  "timestamp": "2026-03-30T14:23:45.123Z",
  "deviceId": "1743456789-abc123def",
  "source": "grid" | "favorite",
  "categoryPath": ["Eten & drinken", "Avondeten", "Vlees"],
  "itemLabel": "Kip",
  "itemId": null,
  "itemEmoji": "🍗",
  "itemSay": "Ik wil graag kip vanavond.",
  "currentTheme": "green",
  "actionType": "leaf" | "folder" | "favorite",
  "time_to_tap_ms": 2150
}
```

---

## Export Workflow

1. **Click export button** → looks for Supabase config
2. **Auto-upload** to `tap_logs` table (if configured)
3. **Local fallback** if Supabase fails → downloads as JSON
4. **Logs cleared** locally after successful export

