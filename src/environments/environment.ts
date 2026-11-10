import pacote from '../../package.json';

// A versão vem do package.json (fonte única: o build Android também lê de lá).
export const environment = {
  production: false,
  appVersion: pacote.version,
  /** Em desenvolvimento os anúncios usam sempre o ID de teste do Google. */
  admobBannerAndroid: ''
};
