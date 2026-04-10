# NestJS

## Overview

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It uses modern JavaScript and is built with TypeScript. NestJS combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

## Architecture

### Modular Architecture

NestJS applications are organized into modules:

```typescript
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Controllers

Handle incoming requests and return responses:

```typescript
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<User> {
    return this.usersService.findOne(id)
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.usersService.remove(id)
  }
}
```

### Providers and Dependency Injection

Services and other providers are injectable:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user)
  }
}
```

## Decorators

### Route Decorators

- `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`, `@All()`
- `@Param()` - Route parameters
- `@Query()` - Query parameters
- `@Body()` - Request body
- `@Headers()` - Request headers
- `@Ip()` - Client IP
- `@Req()`, `@Res()` - Request/Response objects

### Controller Decorators

- `@Controller(prefix)` - Define controller path
- `@Version()` - API versioning
- `@Header()` - Set response headers
- `@HttpCode()` - Set status code
- `@Redirect()` - Redirect response

### Parameter Decorators

```typescript
@Get(':id')
findOne(
  @Param('id') id: string,
  @Query('include') include: string,
  @Headers('authorization') auth: string,
): Promise<User> {
  return this.service.findOne(id, { include, auth });
}
```

## Pipes

Transform and validate input data:

```typescript
// Built-in pipes
@Post()
@UsePipes(new ValidationPipe())
create(@Body() createUserDto: CreateUserDto) {
  // DTO is validated and transformed
}

// Custom pipe
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

## Guards

Protect routes based on conditions:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    return validateRequest(request)
  }
}

// Usage
@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {}
```

## Interceptors

Transform request/response flow:

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((data) => ({ data, timestamp: new Date() })))
  }
}

// Logging interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    return next.handle().pipe(tap(() => console.log(`Request took ${Date.now() - now}ms`)))
  }
}
```

## Exception Filters

Handle exceptions consistently:

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    })
  }
}
```

## Middleware

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request: ${req.method} ${req.url}`)
    next()
  }
}

// Register in module
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("users")
  }
}
```

## DTOs and Validation

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsOptional()
  @Min(0)
  age?: number
}
```

## Database Integration

### TypeORM

```typescript
TypeOrmModule.forRoot({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "user",
  password: "password",
  database: "mydb",
  entities: [User, Post],
  synchronize: true,
})
```

### Mongoose

```typescript
MongooseModule.forRoot("mongodb://localhost/nest")
MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
```

### Prisma

```typescript
PrismaModule.forRoot({
  isGlobal: true,
})
```

## WebSockets

```typescript
@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer() server: Server

  @SubscribeMessage("events")
  handleEvent(@MessageBody() data: string): string {
    return data
  }

  @OnEvent("order.created")
  handleOrderCreated(payload: Order) {
    this.server.emit("newOrder", payload)
  }
}
```

## Testing

```typescript
describe("UsersController", () => {
  let controller: UsersController
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    service = module.get<UsersService>(UsersService)
  })

  it("should return all users", async () => {
    const result = [{ id: 1, name: "Test" }]
    jest.spyOn(service, "findAll").mockResolvedValue(result)
    expect(await controller.findAll()).toBe(result)
  })
})
```

## Microservices

Support for various transporters:

- TCP
- Redis
- MQTT
- NATS
- RabbitMQ
- Kafka
- gRPC

```typescript
@Controller()
export class AppController {
  @MessagePattern({ cmd: "sum" })
  accumulate(data: number[]): number {
    return data.reduce((a, b) => a + b)
  }
}
```

## CLI Commands

- `nest new project-name` - Create new project
- `nest generate module users` - Generate module
- `nest generate controller users` - Generate controller
- `nest generate service users` - Generate service
- `nest build` - Build application
- `nest start` - Run application
- `nest test` - Run tests
