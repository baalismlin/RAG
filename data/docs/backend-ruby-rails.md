# Ruby on Rails

## Overview

Ruby on Rails, often simply called Rails, is a server-side web application framework written in Ruby. It follows the Model-View-Controller (MVC) architectural pattern and emphasizes the use of well-known software engineering patterns and paradigms, including convention over configuration (CoC), don't repeat yourself (DRY), and active record pattern.

## Core Principles

### Convention Over Configuration
Rails makes assumptions about what you want to do and how to do it, reducing the need for explicit configuration.

### Don't Repeat Yourself (DRY)
Every piece of knowledge should have a single, unambiguous representation in the system.

### MVC Architecture
- Model: Data layer and business logic
- View: Presentation layer
- Controller: Handles requests and coordinates models/views

## Project Structure

```
myapp/
├── app/
│   ├── controllers/      # Request handlers
│   ├── models/          # Data models
│   ├── views/           # Templates
│   ├── helpers/         # View helpers
│   ├── assets/          # Static files
│   └── channels/        # WebSocket channels
├── config/              # Configuration files
├── db/                  # Database files
│   ├── migrate/         # Database migrations
│   └── seeds.rb         # Seed data
├── lib/                 # Custom libraries
├── log/                 # Log files
├── public/              # Static public files
├── test/                # Test files
├── tmp/                 # Temporary files
└── Gemfile              # Dependencies
```

## Routing

### config/routes.rb
```ruby
Rails.application.routes.draw do
  # Root route
  root 'home#index'
  
  # Resources (generates all CRUD routes)
  resources :articles
  resources :users do
    resources :posts  # Nested resources
  end
  
  # Custom routes
  get 'about', to: 'pages#about'
  post 'search', to: 'search#index'
  
  # Named routes
  get 'profile', to: 'users#show', as: :user_profile
  
  # API namespace
  namespace :api do
    namespace :v1 do
      resources :articles, only: [:index, :show]
    end
  end
end
```

### Route Helpers
```ruby
articles_path      # /articles
new_article_path   # /articles/new
article_path(@article)  # /articles/:id
edit_article_path(@article)  # /articles/:id/edit
```

## Controllers

### app/controllers/articles_controller.rb
```ruby
class ArticlesController < ApplicationController
  before_action :set_article, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!, except: [:index, :show]
  
  # GET /articles
  def index
    @articles = Article.all.order(created_at: :desc).page(params[:page])
  end
  
  # GET /articles/:id
  def show
  end
  
  # GET /articles/new
  def new
    @article = Article.new
  end
  
  # POST /articles
  def create
    @article = current_user.articles.build(article_params)
    
    if @article.save
      redirect_to @article, notice: 'Article was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  # PATCH/PUT /articles/:id
  def update
    if @article.update(article_params)
      redirect_to @article, notice: 'Article was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  # DELETE /articles/:id
  def destroy
    @article.destroy
    redirect_to articles_url, notice: 'Article was successfully deleted.'
  end
  
  private
  
  def set_article
    @article = Article.find(params[:id])
  end
  
  def article_params
    params.require(:article).permit(:title, :content, :published, :category_ids => [])
  end
end
```

## Models

### Active Record
```ruby
class Article < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_many :taggings, dependent: :destroy
  has_many :tags, through: :taggings
  has_one_attached :featured_image  # Active Storage
  
  # Validations
  validates :title, presence: true, length: { minimum: 5, maximum: 100 }
  validates :content, presence: true
  validates :slug, uniqueness: true
  
  # Callbacks
  before_save :generate_slug
  after_create :send_notification
  
  # Scopes
  scope :published, -> { where(published: true) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_category, ->(category) { where(category: category) }
  
  # Instance methods
  def word_count
    content.split.size
  end
  
  # Class methods
  def self.most_commented
    left_joins(:comments)
      .group(:id)
      .order('COUNT(comments.id) DESC')
  end
  
  private
  
  def generate_slug
    self.slug = title.parameterize
  end
  
  def send_notification
    ArticleMailer.new_article(self).deliver_later
  end
end
```

### Migrations
```ruby
class CreateArticles < ActiveRecord::Migration[7.0]
  def change
    create_table :articles do |t|
      t.string :title, null: false
      t.text :content
      t.string :slug, null: false
      t.boolean :published, default: false
      t.references :user, null: false, foreign_key: true
      
      t.timestamps
    end
    
    add_index :articles, :slug, unique: true
    add_index :articles, :published
  end
end
```

## Views

### ERB Templates
```erb
<!-- app/views/articles/index.html.erb -->
<h1>Articles</h1>

<%= link_to 'New Article', new_article_path, class: 'btn btn-primary' %>

<div class="articles">
  <% @articles.each do |article| %>
    <article class="article-card">
      <h2><%= link_to article.title, article %></h2>
      <p class="meta">
        By <%= article.user.name %> 
        on <%= article.created_at.strftime('%B %d, %Y') %>
      </p>
      <p><%= truncate(article.content, length: 200) %></p>
      
      <% if article.tags.any? %>
        <div class="tags">
          <% article.tags.each do |tag| %>
            <span class="tag"><%= tag.name %></span>
          <% end %>
        </div>
      <% end %>
    </article>
  <% end %>
</div>

<%= paginate @articles %>
```

### Layouts
```erb
<!-- app/views/layouts/application.html.erb -->
<!DOCTYPE html>
<html>
  <head>
    <title><%= content_for?(:title) ? yield(:title) : "My App" %></title>
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <%= stylesheet_link_tag 'application', media: 'all' %>
    <%= javascript_include_tag 'application' %>
  </head>
  <body>
    <%= render 'shared/navbar' %>
    
    <% if notice %>
      <div class="alert alert-success"><%= notice %></div>
    <% end %>
    
    <main>
      <%= yield %>
    </main>
    
    <%= render 'shared/footer' %>
  </body>
</html>
```

## Query Interface

```ruby
# Find by ID
Article.find(1)
Article.find_by(title: 'Hello')

# Where clauses
Article.where(published: true)
Article.where('created_at > ?', 1.week.ago)
Article.where.not(status: 'draft')

# Chaining
Article.where(published: true).order(:created_at).limit(10)

# Joins
Article.joins(:comments).where(comments: { approved: true })
Article.includes(:comments).where(published: true)  # Eager loading

# Aggregations
Article.count
Article.average(:rating)
Article.sum(:views)
Article.group(:status).count

# Pluck
Article.pluck(:title)  # Returns array of titles
```

## Rails Console

Interactive Ruby environment:
```bash
rails console
rails c  # shorthand

# Common commands
Article.all
article = Article.new(title: 'Test')
article.save
Article.find(1).destroy
reload!  # Reload code changes
```

## Rails Generators

```bash
# Generate controller
rails generate controller Articles index show

# Generate model with migration
rails generate model Article title:string content:text published:boolean

# Generate scaffold (model, controller, views, tests)
rails generate scaffold Article title:string content:text

# Generate migration
rails generate migration AddSlugToArticles slug:string

# Destroy generated files
rails destroy scaffold Article
```

## Testing

### Minitest (default)
```ruby
# test/models/article_test.rb
class ArticleTest < ActiveSupport::TestCase
  test "should not save article without title" do
    article = Article.new
    assert_not article.save, "Saved the article without a title"
  end
  
  test "should generate slug" do
    article = Article.create!(title: 'Hello World')
    assert_equal 'hello-world', article.slug
  end
end
```

### RSpec (popular alternative)
```ruby
# spec/models/article_spec.rb
describe Article do
  it "is valid with valid attributes" do
    article = build(:article)
    expect(article).to be_valid
  end
  
  it "is not valid without a title" do
    article = build(:article, title: nil)
    expect(article).not_to be_valid
  end
end
```

## Background Jobs

```ruby
# app/jobs/send_email_job.rb
class SendEmailJob < ApplicationJob
  queue_as :default
  
  def perform(user_id)
    user = User.find(user_id)
    UserMailer.welcome_email(user).deliver_now
  end
end

# Enqueue job
SendEmailJob.perform_later(user.id)
SendEmailJob.perform_now(user.id)  # Run immediately
SendEmailJob.set(wait: 1.hour).perform_later(user.id)
```

## Action Mailer

```ruby
# app/mailers/user_mailer.rb
class UserMailer < ApplicationMailer
  def welcome_email(user)
    @user = user
    @url  = 'http://example.com/login'
    mail(to: @user.email, subject: 'Welcome to My Awesome Site')
  end
end
```

## Common Commands

```bash
# Create new app
rails new myapp --database=postgresql

# Database
rails db:create
rails db:migrate
rails db:seed
rails db:rollback
rails db:drop db:create db:migrate db:seed  # Reset

# Server
rails server
rails s

# Console
rails console
rails c

# Generate
rails generate controller|model|migration|scaffold
rails g

# Tests
rails test
rails test:system

# Assets
rails assets:precompile

# Routes
rails routes
rails routes | grep article

# Credentials
rails credentials:edit
```

## Deployment

Common platforms:
- Heroku (PaaS)
- AWS (EC2, Elastic Beanstalk)
- Digital Ocean
- Render
- Railway
- Capistrano (self-hosted)
