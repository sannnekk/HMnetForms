<?php

declare(strict_types=1);

namespace HMnet\Forms\Content\Cms;

use HMnet\Forms\Core\Content\Form\FormEntity;
use Shopware\Core\Content\Cms\DataResolver\CriteriaCollection;
use Shopware\Core\Content\Cms\DataResolver\Element\CmsElementResolverInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Content\Cms\Aggregate\CmsSlot\CmsSlotEntity;
use Shopware\Core\Content\Cms\DataResolver\ResolverContext\ResolverContext;
use Shopware\Core\Content\Cms\DataResolver\Element\ElementDataCollection;


class HMnetFormCmsElementResolver implements CmsElementResolverInterface
{
	public function getType(): string
	{
		return 'hmnet-form';
	}

	public function collect(CmsSlotEntity $slot, ResolverContext $context): ?CriteriaCollection
	{
		$formId = $slot->getFieldConfig()->get('formId')?->getValue();

		if (!$formId) {
			return null;
		}

		$criteria = new Criteria([$formId]);
		$criteria->addAssociation('fields'); // HMnetFormField

		$collection = new CriteriaCollection();
		$collection->add(
			'hmnet_form_' . $slot->getUniqueIdentifier(),
			FormEntity::ENTITY_NAME . '.definition',
			$criteria
		);

		return $collection;
	}

	public function enrich(
		CmsSlotEntity $slot,
		ResolverContext $context,
		ElementDataCollection $data
	): void {
		$searchResult = $data->get(
			'hmnet_form_' . $slot->getUniqueIdentifier()
		);

		if (!$searchResult || $searchResult->getTotal() === 0) {
			return;
		}

		$formData = $searchResult->getEntities()->first();

		$slot->setData($formData);
	}
}
