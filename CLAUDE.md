# PlanEvento

App Android de planejamento de eventos (convidados, cronograma de tarefas e financeiro), da **Help Soluções em Informática (HSI)**. É um derivado do FestaSim (`C:\repos\HSI\festasim`, https://github.com/lvneves2010/festasim): tem a mesma stack e as mesmas funcionalidades, mas é **totalmente autônomo**. Não usa Firebase nem backend, e os dados ficam só no celular.

- Repo: https://github.com/lvneves2010/planevento (público). O push funciona pelo Git Credential Manager da máquina.
- applicationId: `br.com.hsi.planevento`. **Não pode mudar depois de publicado na Play.**
- Projetos irmãos em `C:\repos\HSI`: `marcador-truco` (Flutter, o mesmo padrão de rodapé HSI e AdMob) e `leoneves-site` (site pessoal, onde vai ficar a política de privacidade).

## Stack

- Ionic 8 + Angular 20 (NgModules, `standalone: false`, como no FestaSim) + **Capacitor 8**.
- **O Capacitor 8 exige Node 22.** O Node global da máquina é o 20 (nvm-windows). Não troque o global: use `export PATH=/c/nvm/v22.23.2:$PATH` nos comandos deste projeto.
- Gradle precisa de JDK 21: `export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"`.
- Android: minSdk 24, compile/target 36 (`android/variables.gradle`).

## Estrutura

- `src/app/home`: dashboard. `tabs/`: abas (Home, Cronograma, Convidados, Evento, Financeiro) mais o rodapé compacto.
- `src/app/abertura`: tela de abertura (~3 s; toque pula) com ícone, nome e rodapé completo da HSI. A rota `''` redireciona para ela.
- `src/app/pages/*`: telas e formulários, praticamente iguais às do FestaSim.
- `src/app/services/armazenamento.service.ts`: **persistência local**. Usa `@capacitor/preferences` (SharedPreferences no Android, localStorage no navegador). Cada coleção é um array JSON numa chave `planevento:<colecao>`, com as mesmas "coleções" do Firestore original (`eventos`, `eventos/<id>/convidados`, `.../tarefas`, `.../categoriasFinanceiras`, `.../itensFinanceiros`). As gravações passam por uma fila para não se perderem.
- `src/app/services/{eventos,convidados,tarefas,financeiro}.service.ts`: mesma API pública (Observables) dos services do FestaSim. Por isso as telas não mudaram.
- `src/app/compartilhado/rodape-empresa`: logo HSI + versão (`compacto` = logo + número), no mesmo padrão do `RodapeEmpresa` do marcador-truco.
- `src/app/services/anuncios.service.ts`: AdMob (`@capacitor-community/admob`).

## Versão

Fonte única: `"version"` do `package.json`. O rodapé lê de lá (`environment.appVersion`) e o `android/app/build.gradle` também: `versionName` = versão e `versionCode` = MAJOR·10000 + MINOR·100 + PATCH. **Suba a versão no package.json antes de cada envio à Play.**

## Publicidade (AdMob)

- Fluxo igual ao do marcador: consentimento UMP (GDPR/LGPD) → `AdMob.initialize()` → banner 320×50 ancorado embaixo, só nas telas internas (nunca na abertura). O banner é nativo e fica por cima da WebView; o evento `SizeChanged` grava `--altura-anuncio`, e `ion-app` ganha esse `margin-bottom` (`global.scss`).
- Botão "Privacidade dos anúncios" na aba Evento, que aparece só quando o UMP exige.
- Sem interstitial, por enquanto.
- IDs: fora do build de produção, ou com `admobBannerAndroid` vazio em `src/environments/environment.prod.ts`, usa o **ID de teste do Google**. O App ID real vai em `android/gradle.properties` (`admobAppId=`). Sem ele, o manifest recebe o App ID de teste.
- Na web (`ng serve`) os anúncios não fazem nada.

## Ícone

- Calendário com confete sobre fundo roxo, gerado por `assets/gerar_icone.py` (PIL). **O logo HSI não é o ícone do app**; ele aparece só no rodapé (`src/assets/logo_hsi.png`, copiado do marcador-truco).
- Para regerar: `python assets/gerar_icone.py && npx capacitor-assets generate --android`.
- Ícone da Play Store (512×512): `assets/icone_playstore_512.png`.

## Comandos

```bash
export PATH=/c/nvm/v22.23.2:$PATH
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"

npm install
npm start                                  # navegador (dados no localStorage)
npm run lint
npm run build:android                      # ng build (produção) + cap sync android
cd android && ./gradlew assembleDebug      # APK de debug
cd android && ./gradlew bundleRelease      # AAB para a Play (exige key.properties)
```

## Play Store (pendências)

- **Upload key**: gerar um `.jks` com `keytool` e criar `android/key.properties` com `storeFile` (relativo a `android/`), `storePassword`, `keyAlias` e `keyPassword`. Os dois estão no `.gitignore`; **nunca commitar**. Guarde backup fora do repo.
- Conta da Play de **organização** em nome da HSI (LEONARDO VINICIUS NEVES LTDA), a mesma do marcador-truco.
- Antes do primeiro envio: criar o app no AdMob, preencher `admobAppId` e `admobBannerAndroid`, marcar "Contém anúncios", preencher Data safety (ID de publicidade coletado pelo SDK; os dados do app ficam só no aparelho) e ter uma política de privacidade que mencione o AdMob.
- Backup: os dados ficam no SharedPreferences, coberto pelo backup automático do Android (`allowBackup="true"`). Não há exportação manual. Se perder o celular sem backup, os dados se perdem.

## Diferenças em relação ao FestaSim

- Sem Firebase, sem `HttpClientModule` e sem `google-services`.
- O e-mail do convidado é opcional. Saiu o e-mail inventado `nome.id@festasim.app`, porque sem servidor ele não tinha função.
- Salvar o Evento volta para `/home`. Antes ia para `/`, que agora é a abertura.
