import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CronogramaFormPage } from './cronograma-form.page';

describe('CronogramaFormPage', () => {
  let component: CronogramaFormPage;
  let fixture: ComponentFixture<CronogramaFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CronogramaFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
