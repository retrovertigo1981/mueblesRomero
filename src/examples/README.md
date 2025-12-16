# Secure Form Hook Documentation

## Overview

The `useSecureForm` hook provides a comprehensive solution for secure form handling in React applications, combining rate limiting, robust validation with Zod, and data sanitization to protect against common security threats.

## Features

- **Rate Limiting**: Prevents form submission abuse (default: 3 attempts per minute, 30s cooldown)
- **Zod Validation**: Schema-based validation with TypeScript support
- **Data Sanitization**: Automatic cleaning of malicious input
- **React Hook Form Integration**: Seamless integration with existing RHF forms
- **TypeScript Support**: Full type safety and IntelliSense
- **Reusable**: Can be used for different form types with custom schemas

## Files Structure

```
src/hooks/
├── useSecureForm.ts    # Main hook implementation
├── formUtils.ts        # Data sanitization utilities

src/examples/
├── ContactFormExample.tsx  # Contact form implementation
├── OrderFormExample.tsx    # Order form implementation
└── README.md              # This documentation
```

## Basic Usage

### 1. Basic Implementation

```tsx
import { useSecureForm } from "@/hooks/useSecureForm";
import { z } from "zod";

// Define your schema
const mySchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message too short"),
});

function MyForm() {
  const {
    register,
    handleSubmit,
    formState,
    isRateLimited,
    timeUntilNextSubmit,
  } = useSecureForm({
    schema: mySchema,
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    onSubmit: async (data) => {
      // Your submission logic here
      console.log("Form submitted:", data);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...register("name")} />
      <input {...register("email")} />
      <textarea {...register("message")} />
      
      {formState.validationErrors.name && (
        <span>{String(formState.validationErrors.name)}</span>
      )}
      
      <button 
        type="submit" 
        disabled={formState.isSubmitting || isRateLimited}
      >
        {isRateLimited ? `Wait ${timeUntilNextSubmit}s` : "Submit"}
      </button>
    </form>
  );
}
```

### 2. Contact Form Implementation

```tsx
import { useContactForm } from "@/hooks/useSecureForm";
import emailjs from "@emailjs/browser";

function ContactForm() {
  const {
    register,
    handleSubmit,
    formState,
    isRateLimited,
  } = useContactForm(async (data) => {
    await emailjs.send(
      process.env.SERVICE_ID!,
      process.env.TEMPLATE_ID!,
      {
        from_name: data.name,
        from_email: data.email,
        message: data.message,
      },
      process.env.PUBLIC_KEY!
    );
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...register("name")} placeholder="Your name" />
      <input {...register("email")} placeholder="your@email.com" />
      <textarea {...register("message")} placeholder="Your message" />
      
      <button 
        type="submit" 
        disabled={formState.isSubmitting || isRateLimited}
      >
        Send Message
      </button>
    </form>
  );
}
```

### 3. Order Form Implementation

```tsx
import { useOrderForm } from "@/hooks/useSecureForm";

function OrderForm() {
  const {
    register,
    handleSubmit,
    formState,
    isRateLimited,
  } = useOrderForm(async (data) => {
    // Your order processing logic
    await processOrder(data);
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...register("nombre")} placeholder="First name" />
      <input {...register("apellido")} placeholder="Last name" />
      <input {...register("telefono")} placeholder="Phone" />
      <input {...register("correo")} placeholder="Email" />
      <input {...register("direccion")} placeholder="Address" />
      <input {...register("ciudad")} placeholder="City" />
      <textarea {...register("comentario")} placeholder="Comments" />
      
      <button 
        type="submit" 
        disabled={formState.isSubmitting || isRateLimited}
      >
        Place Order
      </button>
    </form>
  );
}
```

## Configuration Options

### Rate Limiting Configuration

```tsx
const {
  // ... other hook properties
} = useSecureForm({
  schema: mySchema,
  rateLimitConfig: {
    maxAttempts: 5,        // Maximum submission attempts
    windowMs: 120000,      // Time window in milliseconds (2 minutes)
    cooldownMs: 60000,     // Cooldown period in milliseconds (1 minute)
  },
  onSubmit: mySubmitFunction,
});
```

### Feature Flags

```tsx
const {
  // ... other hook properties
} = useSecureForm({
  schema: mySchema,
  enableRateLimit: true,      // Enable/disable rate limiting
  enableValidation: true,     // Enable/disable Zod validation
  enableSanitization: true,   // Enable/disable data sanitization
  onSubmit: mySubmitFunction,
});
```

## API Reference

### useSecureForm Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schema` | `ZodSchema<T>` | - | Zod validation schema (required) |
| `rateLimitConfig` | `RateLimitConfig` | See defaults | Rate limiting configuration |
| `onSubmit` | `(data: T) => Promise<void>` | - | Submit handler (required) |
| `enableRateLimit` | `boolean` | `true` | Enable rate limiting |
| `enableValidation` | `boolean` | `true` | Enable Zod validation |
| `enableSanitization` | `boolean` | `true` | Enable data sanitization |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `register` | `UseFormRegisterReturn` | RHF register function |
| `handleSubmit` | `SubmitHandler<T>` | RHF submit handler |
| `formState` | `FormState<T>` | Combined form state |
| `isRateLimited` | `boolean` | Whether form is rate limited |
| `timeUntilNextSubmit` | `number \| undefined` | Seconds until next submission allowed |
| `resetRateLimit` | `() => void` | Reset rate limiting state |
| `sanitizeData` | `(data: T) => T` | Manual data sanitization function |

### FormState Interface

```tsx
interface FormState<T> {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  isRateLimited: boolean;
  timeUntilNextSubmit?: number;
  lastSubmitTime?: number | null;
  submitAttempts: number;
  validationErrors: ValidationErrors;
}
```

## Data Sanitization

The hook automatically sanitizes all form data using the following rules:

### String Sanitization
- Removes HTML tags (`<>`)
- Removes JavaScript protocols (`javascript:`)
- Removes event handlers (`onclick=`, `onload=`, etc.)
- Removes control characters
- Trims whitespace

### Object/Array Sanitization
- Recursively sanitizes nested objects
- Sanitizes array elements
- Preserves data structure

### Usage Examples

```tsx
// Manual sanitization
const sanitizedData = sanitizeData(userInput);

// Sanitization with custom config
const sanitizedEmail = sanitizeString(email, {
  maxLength: 100,
  normalizeText: true,
});

// Presets for common use cases
import { SANITIZATION_PRESETS } from "@/hooks/formUtils";

const cleanName = sanitizeString(name, SANITIZATION_PRESETS.NAME);
```

## Security Features

### Rate Limiting
- Prevents brute force attacks
- Configurable limits and time windows
- Automatic cooldown management
- Visual feedback for users

### Input Validation
- Schema-based validation with Zod
- Real-time validation feedback
- Type-safe error handling
- Custom validation rules

### Data Sanitization
- XSS protection
- SQL injection prevention
- Control character removal
- Protocol sanitization

## Error Handling

```tsx
const {
  // ... other properties
} = useSecureForm({
  schema: mySchema,
  onSubmit: async (data) => {
    try {
      // Your submission logic
      await submitToAPI(data);
    } catch (error) {
      // Errors are automatically handled by the hook
      // The hook will show appropriate error messages
      // and implement rate limiting on failures
    }
  },
});
```

## Integration Examples

### With React Query

```tsx
import { useMutation } from "@tanstack/react-query";

const mutation = useMutation({
  mutationFn: submitFormData,
});

const {
  handleSubmit,
  // ... other hook properties
} = useSecureForm({
  schema: mySchema,
  onSubmit: async (data) => {
    await mutation.mutateAsync(data);
  },
});
```

### With State Management

```tsx
const {
  formState,
  // ... other hook properties
} = useSecureForm({
  schema: mySchema,
  onSubmit: handleFormSubmit,
});

// Access form state in your component
useEffect(() => {
  if (formState.isValid) {
    // Enable submit button
  }
}, [formState.isValid]);
```

## Best Practices

1. **Always define schemas**: Use Zod schemas for all form inputs
2. **Handle rate limiting**: Show appropriate UI feedback for rate-limited states
3. **Validate client and server**: Don't rely only on client-side validation
4. **Sanitize inputs**: Enable sanitization for all user inputs
5. **Use type safety**: Leverage TypeScript for better development experience
6. **Test edge cases**: Test rate limiting, validation errors, and sanitization

## Troubleshooting

### Common Issues

1. **Validation errors not showing**: Check that your schema matches your form fields
2. **Rate limiting not working**: Ensure `enableRateLimit` is `true`
3. **Sanitization issues**: Verify `enableSanitization` is enabled
4. **Type errors**: Make sure your schema types match your form data

### Debug Mode

```tsx
const {
  formState,
  checkRateLimit,
  // ... other properties
} = useSecureForm({
  // ... config
});

// Debug rate limiting
console.log("Rate limited:", checkRateLimit());
console.log("Form state:", formState);
```

## Migration from Regular Forms

### Before (Basic React Hook Form)

```tsx
function OldForm() {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### After (Secure Form)

```tsx
function NewForm() {
  const {
    register,
    handleSubmit,
    formState,
    isRateLimited,
  } = useSecureForm({
    schema: z.object({
      name: z.string().min(2, "Name required"),
    }),
    onSubmit: async (data) => {
      console.log(data);
    },
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <input {...register("name")} />
      {formState.validationErrors.name && (
        <span>{String(formState.validationErrors.name)}</span>
      )}
      <button 
        type="submit" 
        disabled={isRateLimited || formState.isSubmitting}
      >
        Submit
      </button>
    </form>
  );
}
```

This migration provides:
- Automatic validation
- Rate limiting protection
- Data sanitization
- Better error handling
- Enhanced security