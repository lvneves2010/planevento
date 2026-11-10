# PlanEvento

Planejamento de eventos no celular: convidados (com confirmação e acompanhantes), cronograma de tarefas e controle financeiro por categoria. Funciona sem internet e sem conta; os dados ficam guardados no próprio aparelho.

Um app da **Help Soluções em Informática (HSI)**, feito com Ionic + Angular + Capacitor.

## Rodando

Requer Node 22+ e, para Android, JDK 21 e o Android SDK.

```bash
npm install
npm start                               # navegador
npm run build:android                   # build + sincroniza o projeto Android
cd android && ./gradlew assembleDebug   # APK de debug
```

Detalhes de arquitetura, anúncios e publicação: [CLAUDE.md](CLAUDE.md).
