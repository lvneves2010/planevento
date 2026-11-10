"""Gera o ícone do PlanEvento (calendário com confete sobre fundo roxo).

Uso (na raiz do projeto):  python assets/gerar_icone.py
Depois:                    npx capacitor-assets generate --android

Saídas em assets/ (fontes do @capacitor/assets) e src/assets/icone_app.png
(usado na tela de abertura).
"""
import os
import random

from PIL import Image, ImageDraw

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'assets')
SS = 2
N = 1024 * SS

ROXO_CLARO = (138, 92, 246)
ROXO_ESCURO = (88, 45, 205)
CONFETE = [(255, 196, 0), (255, 99, 132), (54, 214, 160), (79, 195, 247), (255, 255, 255)]


def fundo():
    """Gradiente diagonal roxo (camada de fundo do adaptive icon)."""
    pequeno = Image.new('RGB', (256, 256))
    px = pequeno.load()
    for y in range(256):
        for x in range(256):
            t = (x + y) / 510
            px[x, y] = tuple(int(a + (b - a) * t) for a, b in zip(ROXO_CLARO, ROXO_ESCURO))
    return pequeno.resize((N, N), Image.BICUBIC).convert('RGBA')



def frente():
    """Calendário + confete, dentro da área segura (~60% central) do adaptive icon."""
    img = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = N / 1024

    # confete (atrás do calendário)
    random.seed(11)
    for _ in range(26):
        x = random.uniform(250, 774) * s
        y = random.uniform(225, 330) * s
        if 330 * s < x < 694 * s and y > 250 * s:
            continue
        cor = random.choice(CONFETE)
        w, h = random.uniform(10, 18) * s, random.uniform(22, 34) * s
        peca = Image.new('RGBA', (int(w * 3), int(h * 3)), (0, 0, 0, 0))
        ImageDraw.Draw(peca).rounded_rectangle((w, h, 2 * w, 2 * h), radius=4 * s, fill=cor + (255,))
        peca = peca.rotate(random.uniform(0, 180), resample=Image.BICUBIC)
        img.alpha_composite(peca, (int(x - peca.width / 2), int(y - peca.height / 2)))

    # corpo do calendário
    x0, y0, x1, y1 = 322 * s, 330 * s, 702 * s, 708 * s
    sombra = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle((x0 + 10 * s, y0 + 16 * s, x1 + 10 * s, y1 + 16 * s), radius=48 * s, fill=(30, 10, 80, 90))
    img.alpha_composite(sombra)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((x0, y0, x1, y1), radius=48 * s, fill=(255, 255, 255, 255))
    # faixa superior
    d.rounded_rectangle((x0, y0, x1, y0 + 120 * s), radius=48 * s, fill=(255, 99, 132, 255))
    d.rectangle((x0, y0 + 70 * s, x1, y0 + 120 * s), fill=(255, 99, 132, 255))
    # argolas
    for cx in (420 * s, 604 * s):
        d.rounded_rectangle((cx - 16 * s, y0 - 40 * s, cx + 16 * s, y0 + 46 * s), radius=16 * s, fill=(60, 30, 140, 255))
    # check grande
    d.line([(420 * s, 532 * s), (490 * s, 602 * s), (612 * s, 470 * s)], fill=ROXO_ESCURO + (255,), width=int(46 * s), joint='curve')
    for px_, py_ in ((420, 532), (612, 470)):
        r = 23 * s
        d.ellipse((px_ * s - r, py_ * s - r, px_ * s + r, py_ * s + r), fill=ROXO_ESCURO + (255,))
    return img


def salvar(img, nome, tamanho=1024):
    img.resize((tamanho, tamanho), Image.LANCZOS).save(os.path.join(SAIDA, nome))


if __name__ == '__main__':
    os.makedirs(SAIDA, exist_ok=True)
    f, b = frente(), fundo()
    completo = b.copy()
    completo.alpha_composite(f)

    salvar(b, 'icon-background.png')
    salvar(f, 'icon-foreground.png')
    salvar(completo, 'icon-only.png')
    completo.resize((512, 512), Image.LANCZOS).save(os.path.join(SAIDA, 'icone_playstore_512.png'))
    completo.resize((320, 320), Image.LANCZOS).save(os.path.join(RAIZ, 'src', 'assets', 'icone_app.png'))
    completo.resize((64, 64), Image.LANCZOS).save(os.path.join(RAIZ, 'src', 'assets', 'icon', 'favicon.png'))

    # splash: fundo branco com o ícone pequeno no centro
    for nome in ('splash.png', 'splash-dark.png'):
        splash = Image.new('RGBA', (2732, 2732), (255, 255, 255, 255) if nome == 'splash.png' else (18, 18, 18, 255))
        ic = completo.resize((520, 520), Image.LANCZOS)
        mascara = Image.new('L', ic.size, 0)
        ImageDraw.Draw(mascara).rounded_rectangle((0, 0, 519, 519), radius=110, fill=255)
        splash.paste(ic, ((2732 - 520) // 2, (2732 - 520) // 2), mascara)
        splash.convert('RGB').save(os.path.join(SAIDA, nome))
    print('ok')
