import pandas as pd
from supabase import create_client

SUPABASE_URL  = 'https://absdasswruhhtaguenfz.supabase.co'
SUPABASE_KEY  = 'sb_secret_d-lyWvAvH2zXMaswqRz3qw_dpRrUagE';

client = create_client(SUPABASE_URL, SUPABASE_KEY)
data = client.table('tap_logs').select('*').execute()
df = pd.DataFrame(data.data)

# Most used phrases
df.groupby('item_text').size().sort_values(ascending=False).head(20)

# Average tap time per category (high = friction)
df.groupby('path').agg({'time_since_last_tap_ms': 'mean'}).sort_values('time_since_last_tap_ms', ascending=False)

# Usage by time of day
df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
df.groupby(['hour', 'item_label']).size()

# Show the results
print("Most used phrases:")
print(df.groupby('item_text').size().sort_values(ascending=False).head(20))
print("\nAverage tap time per category:")
print(df.groupby('path').agg({'time_since_last_tap_ms': 'mean'}).sort_values('time_since_last_tap_ms', ascending=False))
print("\nUsage by time of day:")
print(df.groupby(['hour', 'item_label']).size())