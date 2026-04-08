# Angular

## Overview

Angular is a platform and framework for building single-page client applications using HTML and TypeScript. Developed and maintained by Google, Angular provides a comprehensive solution with built-in tools for routing, forms, HTTP client, and more.

## Architecture

### Modules (NgModule)
Angular applications are organized into modules. The root module (AppModule) bootstraps the application, while feature modules organize related components, directives, and pipes.

### Components
Components control a patch of screen called a view. Each component consists of:
- A TypeScript class with component logic
- An HTML template defining the view
- CSS styles scoped to the component
- Metadata defined with the @Component decorator

### Services and Dependency Injection
Services provide reusable business logic, data access, and utility functions. Angular's DI system makes services available to components through constructor injection.

### Directives
- **Structural Directives**: Change the DOM layout (ngIf, ngFor, ngSwitch)
- **Attribute Directives**: Change the appearance or behavior of elements (ngClass, ngStyle)

## Data Binding

### Interpolation
Display component properties in templates using `{{ expression }}` syntax.

### Property Binding
Bind element properties to component values with `[property]="expression"`.

### Event Binding
Respond to user events using `(event)="handler()"` syntax.

### Two-Way Binding
Combine property and event binding with `[(ngModel)]` for form inputs.

## Pipes

Pipes transform displayed values within templates:
- DatePipe: Formats dates
- UpperCasePipe / LowerCasePipe: Transforms text case
- CurrencyPipe: Formats currency values
- DecimalPipe: Formats numbers
- AsyncPipe: Automatically subscribes to Observables

## Routing

Angular Router enables navigation between views:
- Configure routes with path and component mappings
- RouterOutlet displays routed components
- RouterLink creates navigation links
- Route guards protect routes based on conditions
- Lazy loading for feature modules

## Forms

### Template-Driven Forms
Simple forms using directives like ngModel, suitable for basic scenarios.

### Reactive Forms
Programmatic form creation with FormBuilder, FormGroup, and FormControl. Provides better testing and dynamic form capabilities.

## HTTP Client

The HttpClient module provides:
- Typed request and response objects
- Request and response interception
- Observable-based APIs
- streamlined error handling
- Testability features

## Key Features

### Change Detection
Automatic change detection with OnPush strategy for optimization.

### Ahead-of-Time (AOT) Compilation
Compiles templates during build for better performance.

### Internationalization (i18n)
Built-in tools for translating applications into multiple languages.

### Angular CLI
Command-line interface for scaffolding, building, and testing applications.

## RxJS Integration

Angular heavily uses RxJS Observables for:
- HTTP requests
- Router events
- Form value changes
- Custom event streams

Operators like map, filter, switchMap, and combineLatest enable powerful data transformation.
