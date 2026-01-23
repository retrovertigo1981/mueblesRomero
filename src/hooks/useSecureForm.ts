import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, type UseFormProps, type FieldValues } from "react-hook-form";
import { z, ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  cooldownMs: number;
}

export interface ValidationErrors {
  [key: string]: string | ValidationErrors;
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  isRateLimited: boolean;
  timeUntilNextSubmit?: number;
  lastSubmitTime?: number | null;
  submitAttempts: number;
  validationErrors: ValidationErrors;
}

export interface UseSecureFormOptions<T extends FieldValues = FieldValues>
  extends Omit<UseFormProps<T>, "resolver"> {
  schema: ZodSchema<T>;
  rateLimitConfig?: Partial<RateLimitConfig>;
  onSubmit: (data: T) => Promise<void> | void;
  enableRateLimit?: boolean;
  enableValidation?: boolean;
  enableSanitization?: boolean;
}

/**
 * Hook personalizado para manejo seguro de formularios con rate limiting,
 * validación robusta usando Zod y sanitización de datos
 */
export function useSecureForm<T extends FieldValues = FieldValues>({
  schema,
  rateLimitConfig,
  onSubmit,
  enableRateLimit = true,
  enableValidation = true,
  enableSanitization = true,
  ...formOptions
}: UseSecureFormOptions<T>) {
  // Configuración por defecto para rate limiting
  const defaultRateLimitConfig: RateLimitConfig = {
    maxAttempts: 3,
    windowMs: 60000, // 1 minuto
    cooldownMs: 30000, // 30 segundos
  };

  const finalRateLimitConfig = {
    ...defaultRateLimitConfig,
    ...rateLimitConfig,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
    setValue,
    watch,
    getValues,
    setError,
    clearErrors,
  } = useForm<T>({
    resolver: enableValidation ? zodResolver(schema) : undefined,
    mode: "onChange",
    ...formOptions,
  });

  // Estados para rate limiting
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState<number | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeUntilNextSubmit, setTimeUntilNextSubmit] = useState<number | undefined>();
  
  // Refs para cleanup
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs para el submit attempts tracking
  const submitAttemptsRef = useRef<number[]>([]);

  /**
   * Sanitiza un string removiendo caracteres peligrosos y normalizando
   */
  const sanitizeString = useCallback((value: string): string => {
    if (!enableSanitization || typeof value !== "string") return value;
    
    return value
      .replace(/[<>]/g, "") // Remover caracteres de tags HTML
      .replace(/javascript:/gi, "") // Remover protocolos javascript
      .replace(/on\w+=/gi, "") // Remover event handlers
      // .replace(/[\0-\x1f\x7f]/g, "") // Remover caracteres de control - disabled due to lint
      .trim();
  }, [enableSanitization]);

  /**
   * Sanitiza todos los valores del objeto de forma recursiva
   */
  const sanitizeData = useCallback((data: T): T => {
    if (!enableSanitization) return data;
    
    // Handle primitive types
    if (typeof data === "string") {
      return sanitizeString(data) as unknown as T;
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
      const sanitizedArray = data.map((item: unknown) => sanitizeData(item as T));
      return sanitizedArray as unknown as T;
    }
    
    // Handle objects
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = sanitizeData(value as T);
      }
      return sanitized as unknown as T;
    }
    
    return data;
  }, [enableSanitization, sanitizeString]);

  /**
   * Verifica si el formulario está sujeto a rate limiting
   */
  const checkRateLimit = useCallback((): boolean => {
    if (!enableRateLimit) return false;

    const now = Date.now();
    const { maxAttempts, windowMs } = finalRateLimitConfig;

    // Limpiar intentos antiguos
    submitAttemptsRef.current = submitAttemptsRef.current.filter(
      (timestamp) => now - timestamp < windowMs
    );

    // Verificar si está en cooldown
    if (lastSubmitTime && now - lastSubmitTime < finalRateLimitConfig.cooldownMs) {
      setIsRateLimited(true);
      const remainingTime = finalRateLimitConfig.cooldownMs - (now - lastSubmitTime);
      setTimeUntilNextSubmit(Math.ceil(remainingTime / 1000));
      return true;
    }

    // Verificar si excedió el límite de intentos
    if (submitAttemptsRef.current.length >= maxAttempts) {
      setIsRateLimited(true);
      const oldestAttempt = Math.min(...submitAttemptsRef.current);
      const remainingTime = windowMs - (now - oldestAttempt);
      setTimeUntilNextSubmit(Math.ceil(remainingTime / 1000));
      return true;
    }

    setIsRateLimited(false);
    setTimeUntilNextSubmit(undefined);
    return false;
  }, [enableRateLimit, finalRateLimitConfig, lastSubmitTime]);

  /**
   * Registra un intento de envío
   */
  const registerSubmitAttempt = useCallback(() => {
    if (!enableRateLimit) return;

    const now = Date.now();
    submitAttemptsRef.current.push(now);
    setSubmitAttempts(submitAttemptsRef.current.length);
    setLastSubmitTime(now);
  }, [enableRateLimit]);

  /**
   * Inicia el countdown para el cooldown
   */
  const startCooldownCountdown = useCallback(() => {
    if (!enableRateLimit) return;

    // Limpiar intervals existentes
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      const isLimited = checkRateLimit();
      if (!isLimited) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setIsRateLimited(false);
        setTimeUntilNextSubmit(undefined);
      }
    }, 1000);
  }, [checkRateLimit, enableRateLimit]);

  /**
   * Función de envío segura
   */
  const onSecureSubmit = useCallback(
    async (data: T) => {
      // Verificar rate limiting
      if (checkRateLimit()) {
        toast.error(
          `Demasiados intentos. Intenta de nuevo en ${timeUntilNextSubmit} segundos.`
        );
        return;
      }

      // Sanitizar datos
      const sanitizedData = sanitizeData(data);

      // Registrar intento
      registerSubmitAttempt();

      try {
        // Ejecutar el submit
        await onSubmit(sanitizedData);

        // Resetear intentos si el envío fue exitoso
        if (enableRateLimit) {
          submitAttemptsRef.current = [];
          setSubmitAttempts(0);
        }
      } catch (error) {
        console.error("Error en el envío del formulario:", error);
        toast.error("Error al enviar el formulario. Intenta de nuevo.");
        
        // Iniciar cooldown en caso de error
        if (enableRateLimit) {
          startCooldownCountdown();
        }
      }
    },
    [
      checkRateLimit,
      timeUntilNextSubmit,
      sanitizeData,
      registerSubmitAttempt,
      onSubmit,
      enableRateLimit,
      startCooldownCountdown,
    ]
  );

  /**
   * Resetea el estado del rate limiting
   */
  const resetRateLimit = useCallback(() => {
    if (!enableRateLimit) return;

    submitAttemptsRef.current = [];
    setSubmitAttempts(0);
    setLastSubmitTime(null);
    setIsRateLimited(false);
    setTimeUntilNextSubmit(undefined);

    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, [enableRateLimit]);

  /**
   * Convierte errores de Zod a formato compatible con React Hook Form
   */
  const getValidationErrors = useCallback((): ValidationErrors => {
    if (!enableValidation) return {};
    
    const formattedErrors: ValidationErrors = {};
    
    Object.entries(errors).forEach(([field, error]) => {
      if (error && typeof error === "object" && "message" in error) {
        formattedErrors[field] = error.message as string;
      }
    });
    
    return formattedErrors;
  }, [errors, enableValidation]);

  /**
   * Limpia todos los errores de validación
   */
  const clearValidationErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Estado del formulario
  const formState: FormState = {
    isSubmitting,
    isValid,
    isDirty,
    isRateLimited,
    timeUntilNextSubmit,
    lastSubmitTime,
    submitAttempts,
    validationErrors: getValidationErrors(),
  };

  return {
    // React Hook Form methods
    register,
    handleSubmit: handleSubmit(onSecureSubmit),
    reset,
    setValue,
    watch,
    getValues,
    setError,
    clearErrors: clearValidationErrors,
    
    // Estado del formulario
    formState,
    
    // Estados específicos
    isRateLimited,
    timeUntilNextSubmit,
    submitAttempts,
    
    // Utilidades
    sanitizeData,
    resetRateLimit,
    checkRateLimit,
    
    // Getters
    getValidationErrors,
  };
}

/**
 * Hook específico para formularios de contacto
 */
export function useContactForm(onSubmit: (data: ContactFormData) => Promise<void> | void) {
  const contactSchema = z.object({
    name: z.string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
    email: z.string()
      .email("Ingresa un email válido")
      .max(100, "El email no puede exceder 100 caracteres")
      .refine((email) => {
        const [local, domain] = email.split('@');
        if (!local || !domain || local.length < 2 || !domain.includes('.')) return false;
        const [domainName, tld] = domain.split('.');
        return domainName.length >= 2 && tld.length >= 2;
      }, "El email debe tener un formato más realista (ej: nombre@dominio.com)"),
    phone: z.string()
      .optional()
      .refine((val) => !val || /^[+]?[1-9][\d]{0,15}$/.test(val.replace(/\s/g, "")),
        "Ingresa un teléfono válido"),
    message: z.string()
      .min(10, "El mensaje debe tener al menos 10 caracteres")
      .max(1000, "El mensaje no puede exceder 1000 caracteres"),
    website: z.string().optional(), // Honeypot field
  });

  return useSecureForm({
    schema: contactSchema,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
    onSubmit,
  });
}

/**
 * Hook específico para formularios de pedidos
 */
export function useOrderForm(onSubmit: (data: OrderFormData) => Promise<void> | void) {
  const orderSchema = z.object({
    nombre: z.string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres"),
    apellido: z.string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50, "El apellido no puede exceder 50 caracteres"),
    telefono: z.string()
      .min(8, "El teléfono debe tener al menos 8 dígitos")
      .max(15, "El teléfono no puede exceder 15 dígitos")
      .regex(/^[+]?[1-9][\d]{0,15}$/, "Ingresa un teléfono válido"),
    correo: z.string()
      .email("Ingresa un email válido")
      .max(100, "El email no puede exceder 100 caracteres")
      .refine((email) => {
        const [local, domain] = email.split('@');
        if (!local || !domain || local.length < 2 || !domain.includes('.')) return false;
        const [domainName, tld] = domain.split('.');
        return domainName.length >= 2 && tld.length >= 2;
      }, "El email debe tener un formato más realista (ej: nombre@dominio.com)"),
    direccion: z.string()
      .min(5, "La dirección debe tener al menos 5 caracteres")
      .max(100, "La dirección no puede exceder 100 caracteres"),
    ciudad: z.string()
      .min(2, "La ciudad debe tener al menos 2 caracteres")
      .max(50, "La ciudad no puede exceder 50 caracteres"),
    comentario: z.string()
      .max(500, "El comentario no puede exceder 500 caracteres")
      .optional(),
  });

  return useSecureForm({
    schema: orderSchema,
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      correo: "",
      direccion: "",
      ciudad: "",
      comentario: "",
    },
    onSubmit,
  });
}

// Tipos para los formularios específicos
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  website?: string; // Honeypot field
}

export interface OrderFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  ciudad: string;
  comentario?: string;
}