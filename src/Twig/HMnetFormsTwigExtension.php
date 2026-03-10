<?php declare(strict_types=1);

namespace HMnet\Forms\Twig;

use HMnet\Forms\Core\Content\Form\FormEntity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

use Twig\Environment;

class HMnetFormsTwigExtension extends AbstractExtension
{
    public function __construct(
        private readonly EntityRepository $hmnetFormRepository,
        private readonly Environment $twig,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('hmnet_form', [$this, 'renderForm'], [
                'needs_context' => true,
                'is_safe' => ['html']
            ]),
        ];
    }

    /**
     * Render a HMnet form by ID
     *
     * @param array $context The Twig context
     * @param string $formId The form ID
     * @param string $mode 'embed' or 'button' (default: 'embed')
     * @return string The rendered HTML
     */
    public function renderForm(array $context, string $formId, string $mode = 'embed'): string
    {
        $salesChannelContext = $context['context'] ?? null;

        if (!$salesChannelContext instanceof SalesChannelContext) {
            return '<!-- HMnetForms: Invalid context -->';
        }

        // Load the form with its fields
        $criteria = new Criteria([$formId]);
        $criteria->addAssociation('fields');
        $criteria->getAssociation('fields')->addSorting(new FieldSorting('position', FieldSorting::ASCENDING));

        $form = $this->hmnetFormRepository->search($criteria, $salesChannelContext->getContext())->first();

        if (!$form instanceof FormEntity) {
            return '<!-- HMnetForms: Form not found -->';
        }

        try {
            return $this->twig->render('@HMnetForms/storefront/element/cms-element-hmnet-form.html.twig', [
                'element' => (object) [
                    'data' => $form,
                    'config' => (object) [
                        'representation' => (object) ['value' => $mode]
                    ],
                    'id' => $formId
                ]
            ]);
        } catch (\Exception $e) {
            return '<!-- HMnetForms: Error rendering form: ' . htmlspecialchars($e->getMessage()) . ' -->';
        }
    }
}