# Django

## Overview

Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. Built by experienced developers, it handles much of the hassle of web development, so you can focus on writing your app without needing to reinvent the wheel.

## Core Principles

### DRY (Don't Repeat Yourself)
Django emphasizes code reusability and the principle of not repeating yourself.

### Convention Over Configuration
Django follows conventions that reduce the number of decisions developers need to make.

### Batteries Included
Comes with built-in solutions for common web development tasks.

## Project Structure

```
myproject/
├── manage.py
├── myproject/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
└── myapp/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── views.py
    ├── urls.py
    ├── forms.py
    ├── tests.py
    └── migrations/
```

## Models

### Model Definition
```python
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    published_date = models.DateField()
    isbn = models.CharField(max_length=13, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ['-published_date']
        db_table = 'books'
    
    def __str__(self):
        return self.title
```

### Field Types
- `CharField` - String with max length
- `TextField` - Large text
- `IntegerField` - Integer values
- `DecimalField` - Decimal numbers
- `DateField` / `DateTimeField` - Dates and times
- `BooleanField` - True/False
- `EmailField` - Validated email
- `URLField` - Validated URL
- `FileField` / `ImageField` - File uploads
- `ForeignKey` - Many-to-one relationships
- `ManyToManyField` - Many-to-many relationships
- `OneToOneField` - One-to-one relationships

## Views

### Function-Based Views
```python
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse

def book_list(request):
    books = Book.objects.select_related('author').all()
    return render(request, 'books/list.html', {'books': books})

def book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)
    return render(request, 'books/detail.html', {'book': book})

def api_books(request):
    books = list(Book.objects.values())
    return JsonResponse({'books': books})
```

### Class-Based Views
```python
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView

class BookListView(ListView):
    model = Book
    template_name = 'books/list.html'
    context_object_name = 'books'
    paginate_by = 10

class BookDetailView(DetailView):
    model = Book
    template_name = 'books/detail.html'

class BookCreateView(CreateView):
    model = Book
    fields = ['title', 'author', 'published_date', 'isbn', 'price']
    template_name = 'books/form.html'
    success_url = '/books/'
```

## URL Routing

```python
# urls.py
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.BookListView.as_view(), name='book-list'),
    path('<int:pk>/', views.BookDetailView.as_view(), name='book-detail'),
    path('create/', views.BookCreateView.as_view(), name='book-create'),
    path('api/', include('myapp.api_urls')),
]
```

## Templates

### Template Syntax
```html
<!-- inheritance -->
{% extends 'base.html' %}

{% block content %}
  <h1>{{ book.title }}</h1>
  <p>By {{ book.author.name }}</p>
  
  <!-- conditionals -->
  {% if book.price > 20 %}
    <span class="expensive">Premium</span>
  {% else %}
    <span class="affordable">Standard</span>
  {% endif %}
  
  <!-- loops -->
  {% for book in books %}
    <div class="book">
      <h2>{{ forloop.counter }}. {{ book.title }}</h2>
    </div>
  {% empty %}
    <p>No books available.</p>
  {% endfor %}
  
  <!-- filters -->
  <p>Published: {{ book.published_date|date:"F j, Y" }}</p>
  <p>Price: ${{ book.price|floatformat:2 }}</p>
{% endblock %}
```

## Forms

### Form Classes
```python
from django import forms
from .models import Book

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['title', 'author', 'published_date', 'isbn', 'price']
        widgets = {
            'published_date': forms.DateInput(attrs={'type': 'date'}),
        }

# Usage in views
def book_create(request):
    if request.method == 'POST':
        form = BookForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('book-list')
    else:
        form = BookForm()
    return render(request, 'books/form.html', {'form': form})
```

## Admin Interface

```python
from django.contrib import admin
from .models import Author, Book

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'created_at']
    search_fields = ['name', 'email']
    list_filter = ['created_at']

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'published_date', 'price']
    list_filter = ['published_date', 'author']
    search_fields = ['title', 'isbn']
    date_hierarchy = 'published_date'
    raw_id_fields = ['author']
```

## QuerySet API

### Basic Queries
```python
# All records
Book.objects.all()

# Get by ID
Book.objects.get(pk=1)

# Filter
Book.objects.filter(price__gt=20)
Book.objects.filter(title__icontains='django')
Book.objects.filter(author__name='John')

# Exclude
Book.objects.exclude(price__lt=10)

# Chaining
Book.objects.filter(price__gt=20).order_by('-published_date')

# Aggregation
from django.db.models import Avg, Count, Max, Min, Sum
Book.objects.aggregate(avg_price=Avg('price'))
Book.objects.annotate(book_count=Count('author'))
```

### Field Lookups
- `exact` - Exact match
- `iexact` - Case-insensitive exact
- `contains` - Case-sensitive contains
- `icontains` - Case-insensitive contains
- `gt` / `gte` - Greater than / greater than or equal
- `lt` / `lte` - Less than / less than or equal
- `in` - In a given list
- `range` - Within a range
- `isnull` - NULL check
- `regex` / `iregex` - Regular expression

## Authentication

### Built-in Views
```python
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('password_change/', auth_views.PasswordChangeView.as_view(), name='password_change'),
]
```

### Decorators
```python
from django.contrib.auth.decorators import login_required, permission_required

@login_required
def my_view(request):
    pass

@permission_required('myapp.change_book')
def edit_book(request, pk):
    pass
```

## Django REST Framework

### Serializers
```python
from rest_framework import serializers

class BookSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'author_name', 'published_date', 'price']
```

### ViewSets
```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('author').all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('author'):
            queryset = queryset.filter(author__name=self.request.query_params['author'])
        return queryset
```

### Routers
```python
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'books', BookViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

## Management Commands

- `django-admin startproject myproject` - Create project
- `python manage.py startapp myapp` - Create app
- `python manage.py makemigrations` - Create migrations
- `python manage.py migrate` - Apply migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py runserver` - Start dev server
- `python manage.py shell` - Interactive shell
- `python manage.py test` - Run tests
- `python manage.py collectstatic` - Collect static files
- `python manage.py dbshell` - Database shell
