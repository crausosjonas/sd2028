import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin provides a trusted self-signed certificate for local development,
    // resolving the ERR_SSL_VERSION_OR_CIPHER_MISMATCH browser error.
    basicSsl()
  ],
});
