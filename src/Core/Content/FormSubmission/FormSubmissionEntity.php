<?php

declare(strict_types=1);

namespace HMnet\Forms\Core\Content\FormSubmission;

use HMnet\Forms\Core\Content\Form\FormEntity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ForeignKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ManyToOne;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;

#[EntityAttribute(
	name: FormSubmissionEntity::ENTITY_NAME
)]
class FormSubmissionEntity extends Entity
{
	public const ENTITY_NAME = 'hmnet_form_submission';

	#[PrimaryKey]
	#[Field(type: FieldType::UUID, api: true)]
	public string $id;

	#[ForeignKey(entity: FormEntity::ENTITY_NAME, column: 'form_id', api: true)]
	public ?string $formId = null;

	#[ManyToOne(entity: FormEntity::ENTITY_NAME, ref: 'id', column: 'form_id', api: true)]
	public ?FormEntity $form = null;

	#[Field(type: FieldType::JSON, api: true)]
	public array $data = [];
}
