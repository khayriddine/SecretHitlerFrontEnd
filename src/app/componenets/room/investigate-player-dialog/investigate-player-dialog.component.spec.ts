import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigatePlayerDialogComponent } from './investigate-player-dialog.component';

describe('InvestigatePlayerDialogComponent', () => {
  let component: InvestigatePlayerDialogComponent;
  let fixture: ComponentFixture<InvestigatePlayerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestigatePlayerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestigatePlayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
