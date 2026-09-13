import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/**/*.test.js'],
        // Tests must not read real .env secrets — env.js requires these,
        // so we provide safe placeholders before any module loads.
        env: {
            MONGODB_URI: 'mongodb://placeholder:27017/test',
            JWT_SECRET: 'test-secret',
            PORT: '0',
        },
    },
});
