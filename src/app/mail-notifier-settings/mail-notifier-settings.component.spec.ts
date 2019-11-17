import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailNotifierSettingsComponent } from './mail-notifier-settings.component';

describe('MailNotifierSettingsComponent', () => {
  let component: MailNotifierSettingsComponent;
  let fixture: ComponentFixture<MailNotifierSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailNotifierSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailNotifierSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
