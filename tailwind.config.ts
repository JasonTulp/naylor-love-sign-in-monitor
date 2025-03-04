import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#12bbbb",
        "secondary": "#009FFD",
        "secondary-light": "#FFD699",
        "border": "#23282d",
        "darker": "#0a0c0d",
        "dark": "#0b0d0f",
        "mid": "#161a1d",
        "mid-light": "#2d3134",
        "light": "#5c5f61",
        "light-as": "#d0d1d2",
        "text": "#fff4f0",
        "link": "#009FFD",

        // "gray": "#898989",
        // "gray-mid": "#959595",
        // "gray-light": "#B9B9B9",
        // "gray-dark": "#666666",
      },
      // fontFamily: {
      //   display: ["apotek", "sans-serif"],
      //   body: ["gopher", "sans-serif"],
      // },
      // boxShadow: {
      //   "sharp": "4px 4px 0px 0px",
      //   "sharp-2": "2px 2px 0px 0px",
      //   "sharp-6": "6px 6px 0px 0px",
      // },
    },
  },
  plugins: [],
} satisfies Config;
