import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Armazenamento local do app (substitui o Firestore do FestaSim).
 *
 * Os dados ficam só no aparelho: no Android, no SharedPreferences do app
 * (via @capacitor/preferences); no navegador (ng serve), no localStorage.
 * Cada "coleção" é um array JSON guardado numa chave, e as operações são
 * serializadas numa fila para que duas gravações seguidas não se percam.
 */
@Injectable({
  providedIn: 'root'
})
export class ArmazenamentoService {

  private static readonly PREFIXO = 'planevento:';

  private fila: Promise<unknown> = Promise.resolve();

  async listar<T>(colecao: string): Promise<T[]> {
    await this.fila;
    return this.ler<T>(colecao);
  }

  async inserir<T extends { id: string }>(colecao: string, item: Omit<T, 'id'>): Promise<T> {
    return this.emFila(async () => {
      const itens = await this.ler<T>(colecao);
      const novo = { ...item, id: this.novoId() } as T;
      itens.push(novo);
      await this.gravar(colecao, itens);
      return novo;
    });
  }

  async atualizar<T extends { id: string }>(colecao: string, id: string, alteracoes: Partial<T>): Promise<void> {
    return this.emFila(async () => {
      const itens = await this.ler<T>(colecao);
      const indice = itens.findIndex(i => i.id === id);
      if (indice < 0) {
        throw new Error(`Registro ${id} não encontrado em ${colecao}`);
      }
      itens[indice] = { ...itens[indice], ...alteracoes, id };
      await this.gravar(colecao, itens);
    });
  }

  async remover<T extends { id: string }>(colecao: string, id: string): Promise<void> {
    return this.emFila(async () => {
      const itens = await this.ler<T>(colecao);
      await this.gravar(colecao, itens.filter(i => i.id !== id));
    });
  }

  /** Apaga uma coleção inteira (usado ao excluir um evento). */
  async removerColecao(colecao: string): Promise<void> {
    return this.emFila(() => Preferences.remove({ key: ArmazenamentoService.PREFIXO + colecao }));
  }

  /** Lê um valor simples (não é coleção), como o id do evento selecionado. */
  async lerValor(chave: string): Promise<string | null> {
    await this.fila;
    const { value } = await Preferences.get({ key: ArmazenamentoService.PREFIXO + chave });
    return value;
  }

  async gravarValor(chave: string, valor: string | null): Promise<void> {
    const key = ArmazenamentoService.PREFIXO + chave;
    return this.emFila(() => (valor === null ? Preferences.remove({ key }) : Preferences.set({ key, value: valor })));
  }

  private emFila<R>(operacao: () => Promise<R>): Promise<R> {
    const resultado = this.fila.then(operacao, operacao);
    this.fila = resultado.catch(() => undefined);
    return resultado;
  }

  private async ler<T>(colecao: string): Promise<T[]> {
    const { value } = await Preferences.get({ key: ArmazenamentoService.PREFIXO + colecao });
    if (!value) {
      return [];
    }
    try {
      const dados = JSON.parse(value);
      return Array.isArray(dados) ? dados : [];
    } catch {
      console.error(`Dados corrompidos em ${colecao}; ignorando.`);
      return [];
    }
  }

  private gravar<T>(colecao: string, itens: T[]): Promise<void> {
    return Preferences.set({
      key: ArmazenamentoService.PREFIXO + colecao,
      value: JSON.stringify(itens)
    });
  }

  private novoId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
}
