import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FinanceiroCategoria } from '../models/financeiro-categoria.model';
import { FinanceiroItem } from '../models/financeiro-item.model';
import { ArmazenamentoService } from './armazenamento.service';

interface CategoriaSalva extends FinanceiroCategoria {
  criadoEm?: string;
}

interface ItemSalvo extends FinanceiroItem {
  criadoEm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private armazenamento = inject(ArmazenamentoService);

  private categorias(eventoId: string): string {
    return `eventos/${eventoId}/categoriasFinanceiras`;
  }

  private itens(eventoId: string): string {
    return `eventos/${eventoId}/itensFinanceiros`;
  }

  // ===== CATEGORIAS =====

  getCategoriasPorEvento(eventoId: string): Observable<FinanceiroCategoria[]> {
    return from(this.armazenamento.listar<CategoriaSalva>(this.categorias(eventoId))).pipe(
      map(categorias => categorias.map(c => ({ id: c.id, nome: c.nome })))
    );
  }

  criarCategoria(eventoId: string, nome: string): Observable<void> {
    return from(
      this.armazenamento.inserir<CategoriaSalva>(this.categorias(eventoId), {
        nome,
        criadoEm: new Date().toISOString()
      })
    ).pipe(map(() => void 0));
  }

  /**
   * Exclui a categoria. As despesas dela continuam e passam a aparecer como
   * "Sem categoria".
   */
  deletarCategoria(eventoId: string, categoriaId: string): Observable<void> {
    return from(this.armazenamento.remover<CategoriaSalva>(this.categorias(eventoId), categoriaId));
  }

  // ===== ITENS =====

  /** Itens já com o nome da categoria (o item só guarda o id dela). */
  getItensPorEvento(eventoId: string): Observable<FinanceiroItem[]> {
    return from(
      Promise.all([
        this.armazenamento.listar<ItemSalvo>(this.itens(eventoId)),
        this.armazenamento.listar<CategoriaSalva>(this.categorias(eventoId))
      ])
    ).pipe(
      map(([itens, categorias]) => {
        const nomes = new Map(categorias.map(c => [c.id, c.nome]));
        return itens.map(i => ({
          id: i.id,
          categoriaId: i.categoriaId,
          categoriaNome: nomes.get(i.categoriaId),
          descricao: i.descricao,
          valorPrevisto: i.valorPrevisto,
          valorPago: i.valorPago ?? null
        }));
      })
    );
  }

  criarItem(eventoId: string, payload: Partial<FinanceiroItem>): Observable<void> {
    return from(
      this.armazenamento.inserir<ItemSalvo>(this.itens(eventoId), {
        categoriaId: payload.categoriaId || '',
        descricao: payload.descricao || '',
        valorPrevisto: payload.valorPrevisto || 0,
        valorPago: null,
        criadoEm: new Date().toISOString()
      })
    ).pipe(map(() => void 0));
  }

  atualizarItem(eventoId: string, itemId: string, payload: Partial<FinanceiroItem>): Observable<void> {
    return from(
      this.armazenamento.atualizar<ItemSalvo>(this.itens(eventoId), itemId, {
        descricao: payload.descricao,
        valorPrevisto: payload.valorPrevisto,
        valorPago: payload.valorPago ?? null,
        categoriaId: payload.categoriaId
      })
    );
  }

  deletarItem(eventoId: string, itemId: string): Observable<void> {
    return from(this.armazenamento.remover<ItemSalvo>(this.itens(eventoId), itemId));
  }
}
