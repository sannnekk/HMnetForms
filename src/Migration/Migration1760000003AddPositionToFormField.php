<?php

declare(strict_types=1);

namespace HMnet\Forms\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1760000003AddPositionToFormField extends MigrationStep
{
	public function getCreationTimestamp(): int
	{
		return 1760000003;
	}

	public function update(Connection $connection): void
	{
		$columns = $connection->fetchFirstColumn(
			'SHOW COLUMNS FROM `hmnet_form_field` LIKE \'position\''
		);

		if (!empty($columns)) {
			return;
		}

		$connection->executeStatement(
			'ALTER TABLE `hmnet_form_field` ADD COLUMN `position` INT NOT NULL DEFAULT 0 AFTER `is_required`'
		);
	}

	public function updateDestructive(Connection $connection): void
	{
	}
}
