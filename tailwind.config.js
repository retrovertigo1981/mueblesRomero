/** @type {import('tailwindcss').Config} */
export default {
	// --- INICIO: Contenido copiado y adaptado de Lovable ---

	// 1. Configuración de Dark Mode
	darkMode: ["class"],

	// 2. Rutas de Contenido (MUY IMPORTANTE)
	// Nota: Lovable tenía './pages', './components', './app'.
	// Se añade el alias '@' que definiste en vite.config.ts.
	content: [
		"./index.html", // Necesario para Vite
		"./src/**/*.{js,jsx,ts,tsx}", // Usa el alias '@/...'
	],

	// 3. Prefijo (Necesario para Shadcn/UI)
	prefix: "",

	// 4. Tema (Customizaciones de Colores, Fuentes, y Diseño)
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},

		fontFamily: {
			sans: [
				'Inter',
				'sans-serif'
			]
		},

		extend: {
			fontFamily: {

				// 1. Fuente para Titulares/Logotipo: "Muebles Romero" (DM Serif Display)
				// La utilidad será: font-serif-display
				'serif-display': ['DM Serif Display', 'serif'],

				// 2. Fuente para Cuerpo de Texto: descripciones, párrafos (DM Sans)
				// La utilidad será: font-sans-romero
				'sans-romero': ['DM Sans', 'sans-serif'],
			},

			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				soft: 'var(--shadow-soft)',
				hover: 'var(--shadow-hover)'
			},
			transitionProperty: {
				smooth: 'var(--transition-smooth)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},

	// 5. Plugins (requiere la instalación de 'tailwindcss-animate')
	plugins: [require("tailwindcss-animate")],
	// --- FIN: Contenido copiado y adaptado de Lovable ---
};