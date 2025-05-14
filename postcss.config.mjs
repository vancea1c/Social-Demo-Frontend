import postcssTailwind from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [
    postcssTailwind(), // ← use the new @tailwindcss/postcss plugin
    autoprefixer(),
  ],
};
