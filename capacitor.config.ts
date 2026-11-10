import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.hsi.planevento',
  appName: 'PlanEvento',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
