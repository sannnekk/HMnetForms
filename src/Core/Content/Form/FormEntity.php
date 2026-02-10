<?php

declare(strict_types=1);

namespace HMnet\Forms\Core\Content\Form;

use HMnet\Forms\Core\Content\FormField\FormFieldEntity;
use HMnet\Forms\Core\Content\FormSubmission\FormSubmissionEntity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\OnDelete;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\OneToMany;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Translations;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\Struct\ArrayEntity;

#[EntityAttribute(
	name: FormEntity::ENTITY_NAME
)]
class FormEntity extends Entity
{
	public const ENTITY_NAME = 'hmnet_form';

	#[PrimaryKey]
	#[Field(type: FieldType::UUID, api: true)]
	public string $id;

	#[Field(type: FieldType::STRING, api: true)]
	public string $technicalName;

	#[Field(type: FieldType::STRING, api: true, translated: true)]
	public ?string $name = null;

	#[Field(type: FieldType::TEXT, api: true, translated: true)]
	public ?string $description = null;

	#[Field(type: FieldType::TEXT, api: true, translated: true)]
	public ?string $privacyAgreement = null;

	#[Field(type: FieldType::JSON, api: true)]
	public array $notificationEmails = [];

	/**
	 * @var array<string, FormFieldEntity>|null
	 */
	#[OneToMany(
		entity: FormFieldEntity::ENTITY_NAME,
		ref: 'form_id',
		onDelete: OnDelete::CASCADE,
		api: true
	)]
	public ?array $fields = null;

	/**
	 * @var array<string, ArrayEntity>|null
	 */
	#[Translations]
	public ?array $translations = null;

	/**
	 * @var array<string, FormSubmissionEntity>|null
	 */
	#[OneToMany(
		entity: FormSubmissionEntity::ENTITY_NAME,
		ref: 'form_id',
		onDelete: OnDelete::CASCADE,
		api: true
	)]
	public ?array $submissions = null;
}
