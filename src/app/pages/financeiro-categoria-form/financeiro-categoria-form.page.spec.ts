import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceiroCategoriaFormPage } from './financeiro-categoria-form.page';

describe('FinanceiroCategoriaFormPage', () => {
  let component: FinanceiroCategoriaFormPage;
  let fixture: ComponentFixture<FinanceiroCategoriaFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceiroCategoriaFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
