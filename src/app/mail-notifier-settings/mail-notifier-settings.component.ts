import { Component, OnInit } from '@angular/core';
import { Logger } from 'serilogger';
import { MailConfig } from '../entities/MailConfig';
import { NotifierConfig } from '../entities/NotifierConfig';
import { LoggerService } from '../services/Logger/logger.service';
import { MailService } from '../services/Mail/mail.service';

@Component({
  selector: 'app-mail-notifier-settings',
  templateUrl: './mail-notifier-settings.component.html',
  styleUrls: ['./mail-notifier-settings.component.less']
})
export class MailNotifierSettingsComponent implements OnInit 
{
    // #region fields
    /**
     * Benachrichtungskonfiguration
     */
    private notifierConfig: NotifierConfig;

    /**
     * Service für die Mailconfiguration
     */
    private mailService: MailService;
    
    /**
     * Service für Lognachrichten
     */
     private logger: Logger;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     * 
     * @param mailServcie Service für die Mailconfiguration
     * @param loggerService Service für Lognachrichten
     */
    public constructor(mailService: MailService, loggerService: LoggerService)
    {
        this.mailService = mailService;
        this.logger = loggerService.Logger;

        this.logger.debug("Mail-Notifier-Settings-Component initialisiert (Konstruktor)");
    }
    // #endregion

    // #region ngOnInit
    /**
     * Diese Funtion wird von Angular beim Intitieren der Componente ausgeführt
     */
    public ngOnInit(): void {
        this.mailService.GetConfiguration()
                        .subscribe(
            (notifierConfig) =>
            {
                this.notifierConfig = notifierConfig;
            }, 
            (error) => this.logger.fatal(error, "MailNotifierSettingsComponent: ngOnInit > Fehler beim Ermitteln der MailConfig: ")
        );

        this.logger.debug("Mail-Notifier-Settings-Component initialisiert (Angular ngOnInit)");
    }
    // #endregion

    // #region saveMails
    /**
     * Sendet die Mailconfig an den Server, damit diese gespeichert werden können
     */
    public saveMails() {
        this.logger.info("Mail-Notifier-Settings-Component: saveMail wurde aufgerufen (notifierConfig: {notifierConfig})", this.notifierConfig);

        this.mailService.SetConfiguration(this.notifierConfig)
                        .subscribe(
            () => 
            {
                this.logger.info("Mail-Notifier-Settings-Component: saveMail > Die NotifierConfig wurde erfolgreich vom Server gespeichert.");
                alert("Erfolgreich gespeichert");
            },
            (error) => this.logger.error(error, "Mail-Notifier-Settings-Component: saveMail > Fehler beim Speichern der NotifierConfig: ")
        );

        this.logger.debug("Mail-Notifier-Settings-Component: saveMail wurde abgeschlosssen");
    }
    // #endregion

    // #region addEmptyMail
    /**
     * Fügt eine neue Mail in die Konfig ein
     */
    public addEmptyMail(): void {
        this.logger.info("Mail-Notifier-Settings-Component: addEmptyMail wurde aufgerufen");

        if (this.notifierConfig != null) {
            if (typeof this.notifierConfig.mailConfigs === "object") {
                this.notifierConfig.mailConfigs.push({ mail: "" });
            }
        }

        this.logger.debug("Mail-Notifier-Settings-Component: addEmptyMail wurde abgeschlossen")
    }

    // #endregion

    // #region removeMail
    /**
     * Entfernt eine Mail aus der Konfig
     */
    public removeMail(mailConfigToRemove: MailConfig) {
        this.logger.info("Mail-Notifier-Settings-Component: removeMail wurde aufgerufen (mailConfigToRemove: {mailConfigToRemove})", mailConfigToRemove);

        if (this.notifierConfig != null) {
            if (typeof this.notifierConfig.mailConfigs === "object") {
                let index = this.notifierConfig.mailConfigs.indexOf(mailConfigToRemove);
                this.notifierConfig.mailConfigs.splice(index, 1);
            }
        }

        this.logger.debug("Mail-Notifier-Settings-Component: removeMail wurde abgeschlossen");
    }
    // #endregion
}
