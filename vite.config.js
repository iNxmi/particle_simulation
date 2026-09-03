import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import {version} from "./package.json"

export default defineConfig(({mode}) => {
    const applicationVersion = mode === "development" ? `v${version}-development` : version

    return {
        plugins: [
            tailwindcss(),
        ],
        server: {
            host: true,
            open: true
        },
        define: {
            __APP_VERSION__: JSON.stringify(applicationVersion)
        }
    }
})