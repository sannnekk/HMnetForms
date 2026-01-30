<?php

declare(strict_types=1);

namespace HMnet\Forms\Core\Content\FormField;

use HMnet\Forms\Core\Content\Form\FormEntity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ForeignKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ManyToOne;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Translations;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\Struct\ArrayEntity;

#[EntityAttribute(
	name: FormFieldEntity::ENTITY_NAME
)]
class FormFieldEntity extends Entity
{
	public const ENTITY_NAME = 'hmnet_form_field';

	public const TYPE_TEXT = 'text';
	public const TYPE_TEXTAREA = 'textarea';
	public const TYPE_PHONE = 'phone';
	public const TYPE_EMAIL = 'email';
	public const TYPE_ADDRESS = 'address';
	public const TYPE_CHECKBOX = 'checkbox';

	#[PrimaryKey]
	#[Field(type: FieldType::UUID, api: true)]
	public string $id;

	#[ForeignKey(entity: FormEntity::ENTITY_NAME, column: 'form_id', api: true)]
	public ?string $formId = null;

	#[ManyToOne(entity: FormEntity::ENTITY_NAME, ref: 'id', column: 'form_id', api: true)]
	public ?FormEntity $form = null;

	#[Field(type: FieldType::STRING, api: true)]
	public string $type;

	#[Field(type: FieldType::BOOL, api: true)]
	public bool $isRequired = false;

	#[Field(type: FieldType::STRING, api: true, translated: true)]
	public ?string $title = null;

	#[Field(type: FieldType::TEXT, api: true, translated: true)]
	public ?string $description = null;

	#[Field(type: FieldType::TEXT, api: true, translated: true)]
	public ?string $warning = null;

	/**
	 * @var array<string, ArrayEntity>|null
	 */
	#[Translations]
	public ?array $translations = null;
}
