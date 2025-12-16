/**
 * Utilidades de sanitización de datos para formularios seguros
 * 
 * Este archivo contiene funciones para limpiar y sanitizar datos de entrada,
 * protegiendo contra ataques comunes como XSS, inyección de scripts, etc.
 */

/**
 * Patrones de seguridad para detección de contenido malicioso
 */
export const SECURITY_PATTERNS = {
  // Scripts maliciosos
  SCRIPT_INJECTION: /<script[^>]*>[\s\S]*?<\/script>/gi,
  
  // Event handlers maliciosos
  EVENT_HANDLERS: /on\w+\s*=/gi,
  
  // Protocolos javascript
  JAVASCRIPT_PROTOCOL: /javascript\s*:/gi,
  
  // Caracteres de control peligrosos (simplificado para evitar problemas de lint)
  CONTROL_CHARS: /[\x00-\x1f\x7f]/g,
  
  // Tags HTML peligrosos
  DANGEROUS_TAGS: /<(iframe|object|embed|form|input|script|style|link|meta)/gi,
  
  // Patrones de SQL injection básicos
  SQL_INJECTION: /(union|select|insert|update|delete|drop|create|alter|exec|execute|script)/gi,
} as const;

/**
 * Configuración de sanitización
 */
export interface SanitizationConfig {
  allowHtml?: boolean;
  allowUrls?: boolean;
  allowProtocols?: string[];
  maxLength?: number;
  trimWhitespace?: boolean;
  normalizeText?: boolean;
}

/**
 * Configuración por defecto para sanitización
 */
export const DEFAULT_SANITIZATION_CONFIG: Required<SanitizationConfig> = {
  allowHtml: false,
  allowUrls: true,
  allowProtocols: ['http:', 'https:', 'mailto:', 'tel:'],
  maxLength: 1000,
  trimWhitespace: true,
  normalizeText: true,
};

/**
 * Sanitiza un string individual removiendo contenido peligroso
 */
export function sanitizeString(
  input: string,
  config: Partial<SanitizationConfig> = {}
): string {
  if (typeof input !== 'string') {
    return '';
  }

  const finalConfig = { ...DEFAULT_SANITIZATION_CONFIG, ...config };
  let result = input;

  // Normalizar texto (remover caracteres especiales de encoding)
  if (finalConfig.normalizeText) {
    result = result
      .replace(/\u200B/g, '') // Zero-width space
      .replace(/\u200C/g, '') // Zero-width non-joiner
      .replace(/\u200D/g, '') // Zero-width joiner
      .replace(/\uFEFF/g, ''); // Byte order mark
  }

  // Remover caracteres de control
  result = result.replace(SECURITY_PATTERNS.CONTROL_CHARS, '');

  // Remover protocolos javascript
  if (!finalConfig.allowProtocols.includes('javascript:')) {
    result = result.replace(SECURITY_PATTERNS.JAVASCRIPT_PROTOCOL, '');
  }

  // Remover event handlers
  result = result.replace(SECURITY_PATTERNS.EVENT_HANDLERS, '');

  // Remover tags peligrosos si no se permite HTML
  if (!finalConfig.allowHtml) {
    result = result.replace(SECURITY_PATTERNS.DANGEROUS_TAGS, '');
    result = result.replace(/[<>]/g, '');
  }

  // Remover scripts
  result = result.replace(SECURITY_PATTERNS.SCRIPT_INJECTION, '');

  // Remover patrones de SQL injection básicos
  result = result.replace(SECURITY_PATTERNS.SQL_INJECTION, '');

  // Truncar si es necesario
  if (finalConfig.maxLength && result.length > finalConfig.maxLength) {
    result = result.substring(0, finalConfig.maxLength);
  }

  // Trim whitespace si está habilitado
  if (finalConfig.trimWhitespace) {
    result = result.trim();
  }

  return result;
}

/**
 * Sanitiza un objeto de forma recursiva
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  config?: Partial<SanitizationConfig>
): T {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key, { ...config, maxLength: 100 });
    
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value, config);
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item, config) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[sanitizedKey] = sanitizeObject(value as Record<string, unknown>, config);
    } else {
      sanitized[sanitizedKey] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitiza un array
 */
export function sanitizeArray<T>(
  arr: T[],
  config?: Partial<SanitizationConfig>
): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map(item => {
    if (typeof item === 'string') {
      return sanitizeString(item, config) as unknown as T;
    } else if (item && typeof item === 'object') {
      return sanitizeObject(item as Record<string, unknown>, config) as unknown as T;
    }
    return item;
  });
}

/**
 * Sanitiza datos de formulario de contacto
 */
export function sanitizeContactData(data: {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}) {
  return sanitizeObject({
    name: data.name ? sanitizeString(data.name, { maxLength: 50 }) : '',
    email: data.email ? sanitizeString(data.email, { maxLength: 100 }) : '',
    phone: data.phone ? sanitizeString(data.phone, { maxLength: 15 }) : '',
    message: data.message ? sanitizeString(data.message, { maxLength: 1000 }) : '',
  });
}

/**
 * Sanitiza datos de formulario de pedido
 */
export function sanitizeOrderData(data: {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  ciudad?: string;
  comentario?: string;
}) {
  return sanitizeObject({
    nombre: data.nombre ? sanitizeString(data.nombre, { maxLength: 50 }) : '',
    apellido: data.apellido ? sanitizeString(data.apellido, { maxLength: 50 }) : '',
    telefono: data.telefono ? sanitizeString(data.telefono, { maxLength: 15 }) : '',
    correo: data.correo ? sanitizeString(data.correo, { maxLength: 100 }) : '',
    direccion: data.direccion ? sanitizeString(data.direccion, { maxLength: 100 }) : '',
    ciudad: data.ciudad ? sanitizeString(data.ciudad, { maxLength: 50 }) : '',
    comentario: data.comentario ? sanitizeString(data.comentario, { maxLength: 500 }) : '',
  });
}

/**
 * Valida si una cadena parece ser un email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si una cadena parece ser un teléfono válido
 */
export function isValidPhone(phone: string): boolean {
  // Acepta formatos internacionales básicos
  const phoneRegex = /^[+]?[1-9][\d\s\-()]{7,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Normaliza un número de teléfono
 */
export function normalizePhone(phone: string): string {
  return phone
    .replace(/[^\d+]/g, '') // Remover todo excepto dígitos y +
    .replace(/^00/, '+') // Reemplazar 00 internacional con +
    .trim();
}

/**
 * Normaliza un email
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Detecta si un string contiene contenido potencialmente malicioso
 */
export function containsMaliciousContent(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  return (
    SECURITY_PATTERNS.SCRIPT_INJECTION.test(input) ||
    SECURITY_PATTERNS.JAVASCRIPT_PROTOCOL.test(input) ||
    SECURITY_PATTERNS.EVENT_HANDLERS.test(input) ||
    SECURITY_PATTERNS.SQL_INJECTION.test(input)
  );
}

/**
 * Obtiene estadísticas de sanitización para debugging
 */
export function getSanitizationStats(original: string, sanitized: string) {
  return {
    originalLength: original.length,
    sanitizedLength: sanitized.length,
    charactersRemoved: original.length - sanitized.length,
    wasModified: original !== sanitized,
    containsMalicious: containsMaliciousContent(original),
  };
}

/**
 * Configuración predefinida para diferentes tipos de contenido
 */
export const SANITIZATION_PRESETS = {
  // Para nombres (solo letras, espacios, acentos)
  NAME: {
    maxLength: 50,
    allowHtml: false,
    normalizeText: true,
  },
  
  // Para emails
  EMAIL: {
    maxLength: 100,
    allowHtml: false,
    normalizeText: true,
  },
  
  // Para teléfonos
  PHONE: {
    maxLength: 15,
    allowHtml: false,
    normalizeText: true,
  },
  
  // Para mensajes largos
  MESSAGE: {
    maxLength: 1000,
    allowHtml: false,
    normalizeText: true,
  },
  
  // Para direcciones
  ADDRESS: {
    maxLength: 100,
    allowHtml: false,
    normalizeText: true,
  },
  
  // Para comentarios
  COMMENT: {
    maxLength: 500,
    allowHtml: false,
    normalizeText: true,
  },
} as const;