import { MailConfig } from "./MailConfig";

/**
 * Klasse für die Konfiguration der Mailbenachrichtigungen
 */
 export interface NotifierConfig {
    /**
     * Die Untergrenze vom Puffer ab wann die Mailbenarichtigungen gesendet werden
     */
    lowerThreshold: number;
    /**
     * Die Mailadressen, welche benachrichtig werden sollen
     */
    mailConfigs: Array<MailConfig>;
}