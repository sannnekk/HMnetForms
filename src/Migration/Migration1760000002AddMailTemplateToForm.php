<?php

declare(strict_types=1);

namespace HMnet\Forms\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1760000002AddMailTemplateToForm extends MigrationStep
{
	public function getCreationTimestamp(): int
	{
		return 1760000002;
	}

	public function update(Connection $connection): void
	{
		$columnExists = $connection->fetchOne(
			"SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_NAME = 'hmnet_form' AND COLUMN_NAME = 'mail_template_id' AND TABLE_SCHEMA = DATABASE()"
		);

		if ((int) $columnExists > 0) {
			return;
		}

		$connection->executeStatement(
			<<<'SQL'
ALTER TABLE `hmnet_form`
	ADD COLUMN `mail_template_id` BINARY(16) NULL AFTER `notification_emails`,
	ADD CONSTRAINT `fk.hmnet_form.mail_template_id`
		FOREIGN KEY (`mail_template_id`)
		REFERENCES `mail_template` (`id`)
		ON UPDATE CASCADE
		ON DELETE SET NULL;
SQL
		);
	}

	public function updateDestructive(Connection $connection): void
	{
	}
}
