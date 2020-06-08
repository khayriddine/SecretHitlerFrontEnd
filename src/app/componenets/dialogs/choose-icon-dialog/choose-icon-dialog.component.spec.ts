import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseIconDialogComponent } from './choose-icon-dialog.component';

describe('ChooseIconDialogComponent', () => {
  let component: ChooseIconDialogComponent;
  let fixture: ComponentFixture<ChooseIconDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseIconDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseIconDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
