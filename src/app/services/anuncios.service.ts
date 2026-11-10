import { Injectable, NgZone, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize
} from '@capacitor-community/admob';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

/** ID de teste do Google para banner no Android (seguro para desenvolver). */
const BANNER_TESTE_ANDROID = 'ca-app-pub-3940256099942544/6300978111';

/**
 * Publicidade (Google AdMob), no mesmo modelo do Marcador de Jogos:
 * consentimento UMP (GDPR/LGPD) → inicializa o SDK → banner ancorado embaixo.
 * Não há anúncio na tela de abertura.
 *
 * Fora do build de produção, ou sem `admobBannerAndroid` preenchido em
 * environment.prod.ts, usa o ID de TESTE do Google (nunca clique em anúncios
 * reais do próprio app). O App ID do AdMob fica em android/gradle.properties.
 *
 * Na web (ng serve) não faz nada: o plugin só funciona no aparelho.
 */
@Injectable({
  providedIn: 'root'
})
export class AnunciosService {
  private zone = inject(NgZone);

  /** true quando o usuário precisa ter acesso às opções de privacidade (ex.: GDPR). */
  readonly precisaOpcoesPrivacidade$ = new BehaviorSubject<boolean>(false);

  private iniciando?: Promise<boolean>;
  private bannerVisivel = false;

  /** Coleta o consentimento e inicializa o SDK. Não bloqueia o app. */
  iniciar(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return Promise.resolve(false);
    }
    this.iniciando ??= this.iniciarSdk().catch(err => {
      console.error('Anúncios indisponíveis', err);
      this.iniciando = undefined; // tenta de novo na próxima vez
      return false;
    });
    return this.iniciando;
  }

  /** Mostra o banner embaixo da tela e abre espaço para ele no layout. */
  async mostrarBanner(): Promise<void> {
    if (this.bannerVisivel || !(await this.iniciar())) {
      return;
    }
    this.bannerVisivel = true;

    await AdMob.addListener(BannerAdPluginEvents.SizeChanged, tamanho =>
      this.reservarEspaco(tamanho.height)
    );
    // Sem anúncio (rede, falta de inventário...): libera o espaço e tenta de novo depois.
    await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
      this.reservarEspaco(0);
      setTimeout(() => this.carregarBanner(), AnunciosService.NOVA_TENTATIVA_MS);
    });

    await this.carregarBanner();
  }

  private static readonly NOVA_TENTATIVA_MS = 60_000;

  private async carregarBanner(): Promise<void> {
    const idReal = environment.admobBannerAndroid;
    const usarTeste = !environment.production || !idReal;

    await AdMob.showBanner({
      adId: usarTeste ? BANNER_TESTE_ANDROID : idReal,
      isTesting: usarTeste,
      adSize: BannerAdSize.BANNER, // 320×50, igual ao padrão do Marcador
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0
    });
  }

  async abrirOpcoesPrivacidade(): Promise<void> {
    await AdMob.showPrivacyOptionsForm();
    await this.atualizarStatusPrivacidade();
  }

  private async iniciarSdk(): Promise<boolean> {
    let info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
      info = await AdMob.showConsentForm();
    }
    await this.atualizarStatusPrivacidade();
    if (!info.canRequestAds) {
      return false;
    }
    await AdMob.initialize();
    return true;
  }

  private async atualizarStatusPrivacidade(): Promise<void> {
    const info = await AdMob.requestConsentInfo();
    this.zone.run(() =>
      this.precisaOpcoesPrivacidade$.next(
        // enum só existe como tipo no plugin; o valor em runtime é a string
        String(info.privacyOptionsRequirementStatus) === 'REQUIRED'
      )
    );
  }

  /** O banner nativo fica por cima da WebView: empurra o app para cima. */
  private reservarEspaco(alturaPx: number): void {
    document.documentElement.style.setProperty('--altura-anuncio', `${Math.ceil(alturaPx)}px`);
  }
}
