<?php

declare(strict_types=1);

namespace HMnet\Forms\Service;

use HMnet\Forms\Core\Content\Form\FormEntity;
use Psr\Log\LoggerInterface;
use Shopware\Core\Content\Mail\Service\AbstractMailService;
use Shopware\Core\Framework\Context;

class FormNotificationMailService
{
    public function __construct(
        private readonly AbstractMailService $mailService,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * @param array<int, array{fieldId: string, title: string, type: string, value: mixed}> $submissionData
     */
    public function sendNotificationMail(
        FormEntity $form,
        array $submissionData,
        string $salesChannelId,
        Context $context,
    ): void {
        $notificationEmails = $form->notificationEmails;

        if (empty($notificationEmails)) {
            return;
        }

        $recipients = [];
        foreach ($notificationEmails as $email) {
            $recipients[$email] = $email;
        }

        $formName = $form->name ?? $form->technicalName;
        $subject = sprintf('Neue Formularanfrage: %s', $formName);

        $contentHtml = $this->buildHtmlContent($formName, $submissionData);
        $contentPlain = $this->buildPlainContent($formName, $submissionData);

        $data = [
            'recipients' => $recipients,
            'salesChannelId' => $salesChannelId,
            'subject' => $subject,
            'contentHtml' => $contentHtml,
            'contentPlain' => $contentPlain,
            // Use shop name or fallback for senderName to avoid undefined key
            'senderName' => $formName,
        ];

        try {
            $this->mailService->send($data, $context);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to send HMnetForms notification email', [
                'formId' => $form->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @param array<int, array{fieldId: string, title: string, type: string, value: mixed}> $submissionData
     */
    private function buildHtmlContent(string $formName, array $submissionData): string
    {
        $rows = '';

        foreach ($submissionData as $field) {
            $title = htmlspecialchars($field['title'], \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');
            $value = $this->formatFieldValueHtml($field);

            $rows .= <<<HTML
                <tr>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-weight: 600; vertical-align: top; width: 35%;">{$title}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; vertical-align: top;">{$value}</td>
                </tr>
            HTML;
        }

        $formNameEscaped = htmlspecialchars($formName, \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');

        return <<<HTML
        <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.6;">
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #333333;">Neue Formularanfrage: {$formNameEscaped}</h2>
            <p style="margin: 0 0 16px;">Es wurde eine neue Anfrage über das Formular <strong>{$formNameEscaped}</strong> eingereicht:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                {$rows}
            </table>
        </div>
        HTML;
    }

    /**
     * @param array<int, array{fieldId: string, title: string, type: string, value: mixed}> $submissionData
     */
    private function buildPlainContent(string $formName, array $submissionData): string
    {
        $lines = [];
        $lines[] = sprintf("Neue Formularanfrage: %s\n", $formName);
        $lines[] = sprintf("Es wurde eine neue Anfrage über das Formular \"%s\" eingereicht:\n", $formName);

        foreach ($submissionData as $field) {
            $value = $this->formatFieldValuePlain($field);
            $lines[] = sprintf("%s: %s", $field['title'], $value);
        }

        return implode("\n", $lines);
    }

    /**
     * @param array{fieldId: string, title: string, type: string, value: mixed} $field
     */
    private function formatFieldValueHtml(array $field): string
    {
        $value = $field['value'];
        $type = $field['type'];

        if ($type === 'address' && \is_array($value)) {
            $street = htmlspecialchars($value['street'] ?? '', \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');
            $zip = htmlspecialchars($value['zip'] ?? '', \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');
            $city = htmlspecialchars($value['city'] ?? '', \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');

            return sprintf('%s<br>%s %s', $street, $zip, $city);
        }

        if ($type === 'checkbox') {
            return $value ? 'Ja' : 'Nein';
        }

        if ($type === 'current_page_link' && $value !== '') {
            $escaped = htmlspecialchars((string) $value, \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');

            return sprintf('<a href="%s">%s</a>', $escaped, $escaped);
        }

        return htmlspecialchars((string) $value, \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * @param array{fieldId: string, title: string, type: string, value: mixed} $field
     */
    private function formatFieldValuePlain(array $field): string
    {
        $value = $field['value'];
        $type = $field['type'];

        if ($type === 'address' && \is_array($value)) {
            return sprintf('%s, %s %s', $value['street'] ?? '', $value['zip'] ?? '', $value['city'] ?? '');
        }

        if ($type === 'checkbox') {
            return $value ? 'Ja' : 'Nein';
        }

        return (string) $value;
    }
}
