export interface FinanceiroItem {
  id: string;
  categoriaId: string;
  categoriaNome?: string;
  descricao: string;
  valorPrevisto: number;
  valorPago?: number | null;
}