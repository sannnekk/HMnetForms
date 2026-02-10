<?php

declare(strict_types=1);

namespace HMnet\Forms\Controller;

use HMnet\Forms\Core\Content\Form\FormEntity;
use HMnet\Forms\Core\Content\FormSubmission\FormSubmissionEntity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\PlatformRequest;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Shopware\Storefront\Framework\Routing\StorefrontRouteScope;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: [PlatformRequest::ATTRIBUTE_ROUTE_SCOPE => [StorefrontRouteScope::ID]])]
class HMnetFormController extends StorefrontController
{
	public function __construct(
		private readonly EntityRepository $hmnetFormRepository,
		private readonly EntityRepository $hmnetFormSubmissionRepository,
	) {
	}

	#[Route(
		path: '/hmnet-forms/submit',
		name: 'frontend.hmnet-forms.submit',
		defaults: ['XmlHttpRequest' => true],
		methods: [Request::METHOD_POST]
	)]
	public function submit(Request $request, SalesChannelContext $context): JsonResponse
	{
		$formId = $request->request->get('formId');

		if (!$formId || !Uuid::isValid($formId)) {
			return new JsonResponse([
				['type' => 'danger', 'alert' => 'Ungültige Anfrage.']
			], Response::HTTP_BAD_REQUEST);
		}

		// Load the form with its fields
		$criteria = new Criteria([$formId]);
		$criteria->addAssociation('fields');

		$form = $this->hmnetFormRepository->search($criteria, $context->getContext())->first();

		if (!$form instanceof FormEntity) {
			return new JsonResponse([
				['type' => 'danger', 'alert' => 'Formular nicht gefunden.']
			], Response::HTTP_NOT_FOUND);
		}

		// Collect submitted field data
		$submissionData = [];
		$errors = [];

		foreach ($form->fields ?? [] as $field) {
			$fieldId = $field->id;
			$fieldType = $field->type;
			$fieldTitle = $field->title ?? $fieldId;

			if ($fieldType === 'address') {
				$street = trim((string) $request->request->get("field-{$fieldId}-street", ''));
				$zip = trim((string) $request->request->get("field-{$fieldId}-zip", ''));
				$city = trim((string) $request->request->get("field-{$fieldId}-city", ''));

				$value = [
					'street' => $street,
					'zip' => $zip,
					'city' => $city,
				];

				if ($field->isRequired && ($street === '' || $zip === '' || $city === '')) {
					$errors[] = sprintf('Das Feld "%s" ist ein Pflichtfeld.', $fieldTitle);
				}
			} elseif ($fieldType === 'checkbox') {
				$value = $request->request->has("field-{$fieldId}");

				if ($field->isRequired && !$value) {
					$errors[] = sprintf('Das Feld "%s" ist ein Pflichtfeld.', $fieldTitle);
				}
			} else {
				$value = trim((string) $request->request->get("field-{$fieldId}", ''));

				if ($field->isRequired && $value === '') {
					$errors[] = sprintf('Das Feld "%s" ist ein Pflichtfeld.', $fieldTitle);
				}
			}

			$submissionData[] = [
				'fieldId' => $fieldId,
				'title' => $fieldTitle,
				'type' => $fieldType,
				'value' => $value,
			];
		}

		if (!empty($errors)) {
			return new JsonResponse([
				[
					'type' => 'danger',
					'alert' => implode('<br>', array_map('htmlspecialchars', $errors)),
				]
			], Response::HTTP_BAD_REQUEST);
		}

		// Save submission
		$this->hmnetFormSubmissionRepository->upsert([
			[
				'id' => Uuid::randomHex(),
				'formId' => $formId,
				'data' => $submissionData,
			],
		], $context->getContext());

		return new JsonResponse([
			['type' => 'success', 'alert' => 'Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet.']
		]);
	}
}
