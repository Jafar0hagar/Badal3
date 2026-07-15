import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.badal.app',
  appName: 'بدل للخدمات والعملات',
  webDir: 'dist',
  server: {
    // Enable HTTP cleartext traffic for local emulator development
    cleartext: true,
    // This allows Capacitor to navigate or connect to localhost and Android emulator bridge (10.0.2.2)
    allowNavigation: [
      '10.0.2.2',
      'localhost',
      '*.firebaseapp.com',
      '*.googleapis.com'
    ]
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
