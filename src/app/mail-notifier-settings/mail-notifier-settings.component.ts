import { Component, OnInit } from '@angular/core';
import { MailService, NotifierConfig } from '../services/MailService/mail.service';

@Component({
  selector: 'app-mail-notifier-settings',
  templateUrl: './mail-notifier-settings.component.html',
  styleUrls: ['./mail-notifier-settings.component.less']
})
export class MailNotifierSettingsComponent implements OnInit {

    // #region fields
    /**
     * Benachrichtungskonfiguration
     */
    private notifierConfig: NotifierConfig;
    // #endregion

    // #region ctor
    public constructor(private mailService: MailService) {

    }
    // #endregion

    // #region ngOnInit
    ngOnInit() {
        setTimeout(() => {
            this.mailService.requestMailConfig((config) => {
                this.notifierConfig = config;
            });
        }, 1000);
    }
    // #endregion

    // #region saveMails
    private saveMails() {
        this.mailService.saveMailConfig(this.notifierConfig, () => {
            
        });
    }
    // #endregion

    // #region addEmptyMail
    /**
     * Fügt eine neue Mail in die Konfig ein
     */
    private addEmptyMail() {
        if (this.notifierConfig != null) {
            if (typeof this.notifierConfig.mailConfigs === "object") {
                this.notifierConfig.mailConfigs.push({ mail: "" });
            }
        }
    }
    // #endregion
}
