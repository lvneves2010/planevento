import pacote from '../../package.json';

export const environment = {
  production: true,
  appVersion: pacote.version,
  /**
   * ID do bloco de anúncio (banner) real do AdMob, ex.: 'ca-app-pub-XXXX/YYYY'.
   * Vazio = usa o ID de teste do Google. Preencha antes do build da Play Store.
   */
  admobBannerAndroid: ''
};
