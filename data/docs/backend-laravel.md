# Laravel

## Overview

Laravel is a free, open-source PHP web framework created by Taylor Otwell. It follows the Model-View-Controller (MVC) architectural pattern and is known for its elegant syntax, extensive features, and developer-friendly ecosystem. Laravel aims to make the development process pleasing without sacrificing functionality.

## Core Concepts

### Eloquent ORM

Advanced ActiveRecord implementation for working with databases.

### Blade Templating

Lightweight yet powerful templating engine.

### Artisan CLI

Command-line interface with numerous helpful commands.

### Migration System

Database version control for team collaboration.

## Project Structure

```
myapp/
├── app/
│   ├── Console/          # Artisan commands
│   ├── Exceptions/        # Exception handling
│   ├── Http/
│   │   ├── Controllers/  # Controllers
│   │   └── Middleware/   # HTTP middleware
│   ├── Models/           # Eloquent models
│   └── Providers/        # Service providers
├── bootstrap/            # App bootstrap
├── config/               # Configuration
├── database/
│   ├── factories/        # Model factories
│   ├── migrations/       # Database migrations
│   └── seeders/          # Database seeders
├── public/               # Document root
├── resources/
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript
│   └── views/           # Blade templates
├── routes/
│   ├── api.php          # API routes
│   ├── channels.php     # Broadcasting routes
│   ├── console.php      # Console routes
│   └── web.php          # Web routes
├── storage/              # Logs, cache, compiled views
├── tests/                # Test suites
└── artisan               # CLI entry point
```

## Routing

### routes/web.php

```php
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;

// Basic route
Route::get('/', function () {
    return view('welcome');
});

// Controller routes
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// Resource routes (generates all CRUD)
Route::resource('posts', PostController::class);

// API resource (excludes create/edit views)
Route::apiResource('products', ProductController::class);

// Route parameters with constraints
Route::get('/users/{id}', [UserController::class, 'show'])
    ->where('id', '[0-9]+');

// Named routes
Route::get('/profile', [UserController::class, 'profile'])
    ->name('profile');

// Route groups
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'users']);
});

// Route model binding
Route::get('/posts/{post:slug}', [PostController::class, 'show']);
```

## Controllers

### app/Http/Controllers/UserController.php

```php
<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;

class UserController extends Controller
{
    public function index()
    {
        $users = User::paginate(10);
        return UserResource::collection($users);
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $user = User::create($validated);

        return new UserResource($user);
    }

    public function update(StoreUserRequest $request, User $user)
    {
        $validated = $request->validated();
        $user->update($validated);

        return new UserResource($user);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }
}
```

## Eloquent Models

### app/Models/User.php

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationships
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeAdmins($query)
    {
        return $query->where('is_admin', true);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Mutators
    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => strtolower($value),
            get: fn ($value) => ucfirst($value),
        );
    }
}
```

### Migrations

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->boolean('active')->default(true);
            $table->rememberToken();
            $table->timestamps();

            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

## Blade Templates

### resources/views/layouts/app.blade.php

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>@yield('title', 'My App')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
  </head>
  <body>
    @include('partials.nav')

    <main>@yield('content')</main>

    @include('partials.footer')
  </body>
</html>
```

### resources/views/users/index.blade.php

```html
@extends('layouts.app') @section('title', 'Users') @section('content')
<h1>Users</h1>

@if($users->count())
<ul>
  @foreach($users as $user)
  <li>
    <a href="{{ route('users.show', $user) }}"> {{ $user->name }} </a>

    @if($user->isAdmin())
    <span class="badge">Admin</span>
    @endif
  </li>
  @endforeach
</ul>

{{ $users->links() }} @else
<p>No users found.</p>
@endif @endsection
```

## Query Builder

```php
// Basic queries
User::all();
User::find(1);
User::findOrFail(1);

// Where clauses
User::where('active', true)->get();
User::where('age', '>', 18)->get();
User::where('name', 'like', '%John%')->get();
User::whereBetween('age', [18, 65])->get();
User::whereIn('id', [1, 2, 3])->get();

// Chaining
User::where('active', true)
    ->orderBy('name')
    ->paginate(10);

// Aggregates
User::count();
User::max('age');
User::avg('salary');

// Relationships
$user->posts()->where('published', true)->get();
User::with('posts')->get();  // Eager loading

// Raw queries
DB::table('users')
    ->select(DB::raw('count(*) as user_count, status'))
    ->groupBy('status')
    ->get();
```

## Validation

### Form Requests

```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'age' => 'nullable|integer|min:0|max:150',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please provide your name.',
            'email.unique' => 'This email is already registered.',
        ];
    }
}
```

## Artisan Commands

```bash
# Create
php artisan make:controller UserController
php artisan make:model User -mf  # with migration and factory
php artisan make:migration create_posts_table
php artisan make:request StoreUserRequest
php artisan make:middleware CheckAge

# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed
php artisan migrate:rollback

# Cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Development
php artisan serve
php artisan tinker  # Interactive shell

# Maintenance
php artisan down
php artisan up

# Queue
php artisan queue:work
php artisan queue:restart
```

## Testing

```php
<?php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_users(): void
    {
        User::factory()->count(3)->create();

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_user(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'John Doe');
    }
}
```

## Key Features

- **Authentication**: Built-in authentication system
- **Authorization**: Gates and policies for authorization
- **Artisan**: Powerful CLI for development tasks
- **Broadcasting**: Real-time events with WebSockets
- **Cache**: Multiple cache backends
- **Collections**: Powerful wrapper for working with arrays
- **Events & Listeners**: Decoupled event handling
- **File Storage**: Abstracted file storage (local, S3, etc.)
- **Jobs & Queues**: Background job processing
- **Mail**: Email sending with multiple drivers
- **Notifications**: Multi-channel notifications
- **Scheduling**: Cron job scheduling
- **Testing**: Comprehensive testing utilities
