import { themeToCssVars } from "./themes";

export const suggestions = [
    {
      icon: '✈️',
      name: 'Travel Planner App',
      description: 'Trip planning dashboard with maps, itineraries, and booking cards. Clean modern layout with soft colors.'
    },
    {
      icon: '📊',
      name: 'AI Learning Platform',
      description: 'Gamified learning experience with progress steps and streaks. Friendly, engaging, and colorful UI.'
    },
    {
      icon: '💳',
      name: 'Finance Tracker',
      description: 'Expense tracking dashboard with charts and budget goals. Minimal UI with dark mode support.'
    },
    {
      icon: '🛒',
      name: 'E-Commerce Store',
      description: 'Product browsing and checkout experience. Premium UI with strong call-to-action design.'
    },
    {
      icon: '📅',
      name: 'Smart To-Do Planner',
      description: 'Task management with calendar and priority views. Simple productivity-focused interface.'
    },
    {
      icon: '🍔',
      name: 'Food Delivery App',
      description: 'Restaurant listings and fast ordering flow. Bright visuals with large food images.'
    },
    {
      icon: '🧒',
      name: 'Kids Learning App',
      description: 'Interactive learning app for kids with rewards. Colorful UI and playful illustrations.'
    }
  ];

  export const HtmlWrapper = (theme: any, htmlCode: string) => {
    return `
        <!doctype html>
        <html>
            <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
                <!-- Google Font -->
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">


            <!-- Tailwind + Iconify -->
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            colors: {
                                background: 'var(--background)',
                                foreground: 'var(--foreground)',
                                primary: 'var(--primary)',
                                secondary: 'var(--secondary)',
                                accent: 'var(--accent)',
                                muted: 'var(--muted)',
                                border: 'var(--border)',
                                card: 'var(--card)',
                            }
                        }
                    }
                }
            </script>
            <style >
               ${themeToCssVars(theme)}
            </style>
            </head>
        <body class="bg-background text-foreground w-full">
        ${htmlCode ?? ""}
        </body>
        </html>
    `
  }