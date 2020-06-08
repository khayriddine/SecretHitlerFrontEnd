import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePresidentDialogComponent } from './choose-president-dialog.component';

describe('ChoosePresidentDialogComponent', () => {
  let component: ChoosePresidentDialogComponent;
  let fixture: ComponentFixture<ChoosePresidentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChoosePresidentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoosePresidentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
