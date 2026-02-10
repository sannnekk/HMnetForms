<?php

declare(strict_types=1);

namespace HMnet\Forms\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1760000001CreateFormSubmissionSchema extends MigrationStep
{
	public function getCreationTimestamp(): int
	{
		return 1760000001;
	}

	public function update(Connection $connection): void
	{
		$connection->executeStatement(
			<<<'SQL'
CREATE TABLE IF NOT EXISTS `hmnet_form_submission` (
	`id` BINARY(16) NOT NULL,
	`form_id` BINARY(16) NOT NULL,
	`data` JSON NOT NULL DEFAULT (JSON_OBJECT()),
	`created_at` DATETIME(3) NOT NULL,
	`updated_at` DATETIME(3) NULL,
	PRIMARY KEY (`id`),
	KEY `idx.hmnet_form_submission.form_id` (`form_id`),
	CONSTRAINT `fk.hmnet_form_submission.form_id`
		FOREIGN KEY (`form_id`)
		REFERENCES `hmnet_form` (`id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
SQL
		);
	}

	public function updateDestructive(Connection $connection): void
	{
		$connection->executeStatement('DROP TABLE IF EXISTS `hmnet_form_submission`');
	}
}
