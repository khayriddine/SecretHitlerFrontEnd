import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KillMemberDialogComponent } from './kill-member-dialog.component';

describe('KillMemberDialogComponent', () => {
  let component: KillMemberDialogComponent;
  let fixture: ComponentFixture<KillMemberDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KillMemberDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KillMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
