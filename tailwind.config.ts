import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-peaceful': 'var(--gradient-peaceful)',
				'gradient-warm': 'var(--gradient-warm)'
			},
			boxShadow: {
				'peaceful': 'var(--shadow-peaceful)',
				'warm': 'var(--shadow-warm)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
				'card-hover': 'var(--shadow-card-hover)'
			},
			borderRadius: {
				xl: 'calc(var(--radius) + 4px)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'inter': ['Inter', 'system-ui', 'sans-serif'],
				'playfair': ['Playfair Display', 'serif'],
				'display': ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif']
			},
			transitionTimingFunction: {
				'gentle': 'var(--transition-gentle)'
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
				},
				'gentle-fade': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'peaceful-glow': {
					'0%, 100%': { opacity: '0.5' },
					'50%': { opacity: '1' }
				},
				'ripple': {
					'0%': { transform: 'scale(0)', opacity: '1' },
					'100%': { transform: 'scale(4)', opacity: '0' }
				},
				'pulse-ring': {
					'0%': { transform: 'scale(0.8)', opacity: '0.6' },
					'80%, 100%': { transform: 'scale(2.4)', opacity: '0' }
				},
				'count-up': {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'float-slow': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-6px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px 0 hsl(var(--success) / 0.25)' },
					'50%': { boxShadow: '0 0 40px 6px hsl(var(--success) / 0.45)' }
				},
				'rise-in': {
					'0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gentle-fade': 'gentle-fade 0.6s ease-out',
				'peaceful-glow': 'peaceful-glow 3s ease-in-out infinite',
				'ripple': 'ripple 0.6s ease-out',
				'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
				'count-up': 'count-up 0.5s ease-out',
				'float-slow': 'float-slow 6s ease-in-out infinite',
				'shimmer': 'shimmer 2.5s linear infinite',
				'gradient-shift': 'gradient-shift 8s ease infinite',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'rise-in': 'rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
