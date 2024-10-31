import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailNotifierSettingsComponent } from './mail-notifier-settings.component';

describe('MailNotifierSettingsComponent', () => {
  let component: MailNotifierSettingsComponent;
  let fixture: ComponentFixture<MailNotifierSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailNotifierSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MailNotifierSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
