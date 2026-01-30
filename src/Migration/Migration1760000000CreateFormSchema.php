<?php

declare(strict_types=1);

namespace HMnet\Forms\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1760000000CreateFormSchema extends MigrationStep
{
	public function getCreationTimestamp(): int
	{
		return 1760000000;
	}

	public function update(Connection $connection): void
	{
		$this->createFormTable($connection);
		$this->createFormTranslationTable($connection);
		$this->createFormFieldTable($connection);
		$this->createFormFieldTranslationTable($connection);
	}

	public function updateDestructive(Connection $connection): void
	{
		$connection->executeStatement('DROP TABLE IF EXISTS `hmnet_form_field_translation`');
		$connection->executeStatement('DROP TABLE IF EXISTS `hmnet_form_field`');
		$connection->executeStatement('DROP TABLE IF EXISTS `hmnet_form_translation`');
		$connection->executeStatement('DROP TABLE IF EXISTS `hmnet_form`');
	}

	private function createFormTable(Connection $connection): void
	{
		$connection->executeStatement(
			<<<'SQL'
CREATE TABLE IF NOT EXISTS `hmnet_form` (
	`id` BINARY(16) NOT NULL,
	`technical_name` VARCHAR(255) NOT NULL,
	`notification_emails` JSON NOT NULL DEFAULT (JSON_ARRAY()),
	`created_at` DATETIME(3) NOT NULL,
	`updated_at` DATETIME(3) NULL,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uniq.hmnet_form.technical_name` (`technical_name`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
SQL
		);
	}

	private function createFormTranslationTable(Connection $connection): void
	{
		$connection->executeStatement(
			<<<'SQL'
CREATE TABLE IF NOT EXISTS `hmnet_form_translation` (
	`hmnet_form_id` BINARY(16) NOT NULL,
	`language_id` BINARY(16) NOT NULL,
	`name` VARCHAR(255) NULL,
	`description` LONGTEXT NULL,
	`privacy_agreement` LONGTEXT NULL,
	`created_at` DATETIME(3) NOT NULL,
	`updated_at` DATETIME(3) NULL,
	PRIMARY KEY (`hmnet_form_id`, `language_id`),
	CONSTRAINT `fk.hmnet_form_translation.form_id`
		FOREIGN KEY (`hmnet_form_id`)
		REFERENCES `hmnet_form` (`id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT `fk.hmnet_form_translation.language_id`
		FOREIGN KEY (`language_id`)
		REFERENCES `language` (`id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
SQL
		);
	}

	private function createFormFieldTable(Connection $connection): void
	{
		$connection->executeStatement(
			<<<'SQL'
CREATE TABLE IF NOT EXISTS `hmnet_form_field` (
	`id` BINARY(16) NOT NULL,
	`form_id` BINARY(16) NOT NULL,
	`type` VARCHAR(32) NOT NULL,
	`is_required` TINYINT(1) NOT NULL DEFAULT 0,
	`created_at` DATETIME(3) NOT NULL,
	`updated_at` DATETIME(3) NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT `fk.hmnet_form_field.form_id`
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

	private function createFormFieldTranslationTable(Connection $connection): void
	{
		$connection->executeStatement(
			<<<'SQL'
CREATE TABLE IF NOT EXISTS `hmnet_form_field_translation` (
	`hmnet_form_field_id` BINARY(16) NOT NULL,
	`language_id` BINARY(16) NOT NULL,
	`title` VARCHAR(255) NULL,
	`description` LONGTEXT NULL,
	`warning` LONGTEXT NULL,
	`created_at` DATETIME(3) NOT NULL,
	`updated_at` DATETIME(3) NULL,
	PRIMARY KEY (`hmnet_form_field_id`, `language_id`),
	CONSTRAINT `fk.hmnet_form_field_translation.field_id`
		FOREIGN KEY (`hmnet_form_field_id`)
		REFERENCES `hmnet_form_field` (`id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT `fk.hmnet_form_field_translation.language_id`
		FOREIGN KEY (`language_id`)
		REFERENCES `language` (`id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
SQL
		);
	}
}
