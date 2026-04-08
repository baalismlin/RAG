# Supabase

## Overview

Supabase is an open-source Firebase alternative that provides a complete backend infrastructure built on top of PostgreSQL. It offers a comprehensive suite of tools including database, authentication, real-time subscriptions, storage, and edge functions.

## Core Features

### PostgreSQL Database
Fully managed PostgreSQL with all its features including:
- Row Level Security (RLS)
- Real-time subscriptions
- Full-text search
- JSON/JSONB support
- Extensions support

### Authentication
Built-in user management with:
- Email/password authentication
- OAuth providers (GitHub, Google, Twitter, etc.)
- Magic links
- JWT tokens
- Multi-factor authentication

### Real-time
Subscribe to database changes:
- Database changes (INSERT, UPDATE, DELETE)
- Broadcast events
- Presence tracking

### Storage
Object storage for files:
- Image transformations
- CDN delivery
- Access control

### Edge Functions
Serverless functions running globally:
- Deno runtime
- TypeScript/JavaScript
- Low latency execution

## Database

### Connecting
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// With service role (admin access)
const adminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### CRUD Operations
```javascript
// Insert
const { data, error } = await supabase
  .from('users')
  .insert({ email: 'john@example.com', name: 'John Doe' })
  .select();

// Insert multiple
const { data, error } = await supabase
  .from('users')
  .insert([
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' }
  ]);

// Select
const { data: users, error } = await supabase
  .from('users')
  .select('*');

// Select with joins
const { data: usersWithPosts, error } = await supabase
  .from('users')
  .select(`
    id,
    email,
    posts (id, title, created_at)
  `);

// Select with filters
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active')
  .gt('created_at', '2024-01-01')
  .order('created_at', { ascending: false })
  .limit(10);

// Update
const { data, error } = await supabase
  .from('users')
  .update({ name: 'John Updated' })
  .eq('id', 1)
  .select();

// Delete
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', 1);

// Upsert
const { data, error } = await supabase
  .from('users')
  .upsert({ id: 1, email: 'john@example.com', name: 'John' })
  .select();
```

### Filter Operators
```javascript
const { data } = await supabase
  .from('products')
  .select('*')
  // Equality
  .eq('category', 'electronics')
  // Not equal
  .neq('status', 'discontinued')
  // Greater than
  .gt('price', 100)
  // Greater than or equal
  .gte('stock', 10)
  // Less than
  .lt('price', 1000)
  // Less than or equal
  .lte('stock', 100)
  // Like (pattern matching)
  .like('name', '%laptop%')
  // Case insensitive like
  .ilike('name', '%LAPTOP%')
  // Is
  .is('deleted_at', null)
  // In array
  .in('category', ['electronics', 'computers'])
  // Contains (for array/jsonb columns)
  .contains('tags', ['new'])
  // Contained by
  .containedBy('tags', ['electronics', 'computers', 'laptops'])
  // Range
  .range('created_at', '2024-01-01', '2024-12-31');
```

## Authentication

### Sign Up/Sign In
```javascript
// Email/password sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in with OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'https://example.com/auth/callback'
  }
});

// Magic link
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### User Management
```javascript
// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Update user
const { data, error } = await supabase.auth.updateUser({
  email: 'new@example.com',
  data: { full_name: 'New Name' }
});

// Reset password
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com'
);
```

### Auth State Changes
```javascript
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
  // Events: SIGNED_IN, SIGNED_OUT, USER_UPDATED, TOKEN_REFRESHED, etc.
});
```

## Row Level Security (RLS)

### Enabling RLS
```sql
-- Enable RLS on table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

### RLS with Supabase Auth
```sql
-- Policy for authenticated users
CREATE POLICY "Authenticated users can read posts" ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy using JWT claims
CREATE POLICY "Users can access their data" ON documents
  FOR ALL
  USING (auth.jwt() ->> 'email' = owner_email);
```

## Real-time Subscriptions

### Database Changes
```javascript
// Subscribe to all changes
const channel = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('Change received!', payload);
      // payload.eventType: INSERT, UPDATE, DELETE
      // payload.new: new record
      // payload.old: old record (for updates/deletes)
    }
  )
  .subscribe();

// Subscribe to specific events
const channel = supabase
  .channel('users-inserts')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'users' },
    (payload) => {
      console.log('New user:', payload.new);
    }
  )
  .subscribe();

// Subscribe with filters
const channel = supabase
  .channel('user-1-posts')
  .on(
    'postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'posts',
      filter: 'user_id=eq.1'
    },
    (payload) => {
      console.log('Post change:', payload);
    }
  )
  .subscribe();

// Unsubscribe
supabase.removeChannel(channel);
```

### Broadcast
```javascript
// Send broadcast
const channel = supabase.channel('room-1');

channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { text: 'Hello everyone!' }
    });
  }
});

// Receive broadcast
const channel = supabase
  .channel('room-1')
  .on('broadcast', { event: 'message' }, (payload) => {
    console.log('Received:', payload);
  })
  .subscribe();
```

### Presence
```javascript
// Track presence
const channel = supabase.channel('online-users');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Online users:', state);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ 
        user_id: 'user-1',
        online_at: new Date().toISOString() 
      });
    }
  });
```

## Storage

### Upload Files
```javascript
// Upload file
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('public/avatar1.png', file, {
    cacheControl: '3600',
    upsert: false
  });

// Get public URL
const { data } = supabase
  .storage
  .from('avatars')
  .getPublicUrl('public/avatar1.png');

// Download file
const { data, error } = await supabase
  .storage
  .from('avatars')
  .download('public/avatar1.png');

// Delete file
const { data, error } = await supabase
  .storage
  .from('avatars')
  .remove(['public/avatar1.png']);
```

## Edge Functions

### Creating Functions
```typescript
// supabase/functions/hello/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();
  
  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Invoking Functions
```javascript
// From client
const { data, error } = await supabase.functions.invoke('hello', {
  body: { name: 'World' }
});

// From server (with service role)
const { data, error } = await supabase.functions.invoke('process-data', {
  body: { ids: [1, 2, 3] }
});
```

## Database Functions

### Creating Functions
```sql
-- SQL function
CREATE OR REPLACE FUNCTION get_user_posts(user_uuid UUID)
RETURNS TABLE (id BIGINT, title TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.created_at
  FROM posts p
  WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;
```

### Calling Functions
```javascript
const { data, error } = await supabase
  .rpc('get_user_posts', { user_uuid: 'user-id-here' });
```

## TypeScript Support

### Generated Types
```bash
# Generate types from schema
npx supabase gen types typescript --project-id your-project-ref > types/supabase.ts
```

### Using Types
```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Fully typed queries
const { data } = await supabase
  .from('users')  // Autocomplete table names
  .select('*');   // Type-safe column access
```

## CLI Commands

```bash
# Login
supabase login

# Initialize project
supabase init

# Start local environment
supabase start

# Link to remote project
supabase link --project-ref your-project-ref

# Database migrations
supabase db diff --linked
supabase db push

# Generate types
supabase gen types typescript --local

# Edge functions
supabase functions new my-function
supabase functions serve
supabase functions deploy my-function

# Manage secrets
supabase secrets set MY_SECRET=value
supabase secrets list
```
