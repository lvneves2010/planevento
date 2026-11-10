import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceiroItemFormPage } from './financeiro-item-form.page';

describe('FinanceiroItemFormPage', () => {
  let component: FinanceiroItemFormPage;
  let fixture: ComponentFixture<FinanceiroItemFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceiroItemFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
