<?php

namespace App\Http\Controllers;

use App\Filament\Pages\ManageDesktopMegaMenu;
use App\Filament\Pages\ManageEquipmentBrands;
use App\Models\BrewGuide;
use App\Models\Category;
use App\Models\EquipmentBundle;
use App\Models\FixedBundle;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function categories(): Response
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        $navCategories = $settings['desktop_mega_menu_categories']
            ?? ManageDesktopMegaMenu::getDefaultCategories();

        return Inertia::render('categories/index', [
            'navCategories' => $navCategories,
        ]);
    }

    public function index(Request $request): Response
    {
        $catSlug = (string) $request->input('category', '');
        $search = trim((string) $request->input('q', ''));
        $series = (string) $request->input('series', '');
        $brand = trim((string) $request->input('brand', ''));
        $sort = (string) $request->input('sort', 'featured');

        $isBundleFilter = $catSlug === 'paket-bundling' || $series === 'paket-bundling';
        $includeBundles = $isBundleFilter || (empty($catSlug) && empty($series) && (empty($brand) || $brand === 'all'));

        $bundleCards = collect();
        if ($includeBundles) {
            $bundleQuery = EquipmentBundle::active()
                ->with(['slots.category', 'slots.items.variant'])
                ->orderBy('sort_order')
                ->orderByDesc('id');

            if ($search !== '') {
                $bundleQuery->where(function ($bq) use ($search) {
                    $bq->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $customCards = $bundleQuery->get()->map(fn (EquipmentBundle $b) => $b->toProductCardArray());

            $fixedQuery = FixedBundle::active()
                ->with(['items.product.primaryImage', 'items.variant'])
                ->orderBy('sort_order')
                ->orderByDesc('id');

            if ($search !== '') {
                $fixedQuery->where(function ($fq) use ($search) {
                    $fq->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $fixedCards = $fixedQuery->get()->map(fn (FixedBundle $b) => $b->toProductCardArray());
            $bundleCards = $fixedCards->concat($customCards)->values();
        }

        if ($isBundleFilter) {
            $products = new \Illuminate\Pagination\LengthAwarePaginator(
                $bundleCards->values(),
                $bundleCards->count(),
                24,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        } else {
            $query = Product::active()->forWebsite()->with(['variants', 'images', 'categories']);

            // Search
            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('tasting_notes', 'like', "%{$search}%")
                        ->orWhere('origin', 'like', "%{$search}%");
                });
            }

            // Filter by category slug (support hierarchy: parent includes children)
            if ($catSlug !== '') {
                $category = Category::where('slug', $catSlug)->first();
                if ($category) {
                    $categoryIds = Category::where('id', $category->id)
                        ->orWhere('parent_id', $category->id)
                        ->pluck('id');

                    $query->whereHas('categories', function ($q) use ($categoryIds) {
                        $q->whereIn('categories.id', $categoryIds);
                    });
                } else {
                    $query->whereHas('categories', function ($q) use ($catSlug) {
                        $q->where('slug', $catSlug);
                    });
                }
            }

            // Filter by series
            if ($series !== '') {
                $query->where(function ($q) use ($series) {
                    $q->where('series', $series)
                        ->orWhereHas('categories', function ($cq) use ($series) {
                            $cq->where('slug', $series);
                        });
                });
            }

            // Filter by process
            if ($process = $request->input('process')) {
                $query->where('process', 'like', "%{$process}%");
            }

            // Filter by brand (origin)
            if ($brand !== '' && $brand !== 'all') {
                $query->where(function ($q) use ($brand) {
                    $q->where('origin', $brand)
                        ->orWhere('name', 'like', "%{$brand}%");
                });
            }

            // Sort
            match ($sort) {
                'price_asc' => $query->orderBy('min_price', 'asc'),
                'price_desc' => $query->orderBy('min_price', 'desc'),
                'newest' => $query->orderBy('released_at', 'desc'),
                'name' => $query->orderBy('name', 'asc'),
                default => $query->orderBy('is_featured', 'desc')->orderBy('id', 'desc'),
            };

            $products = $query->paginate(24)->withQueryString();

            if ($products->currentPage() === 1 && $bundleCards->isNotEmpty()) {
                $merged = $bundleCards->concat($products->getCollection())->values();
                $products->setCollection($merged);
                $products = new \Illuminate\Pagination\LengthAwarePaginator(
                    $merged,
                    $products->total() + $bundleCards->count(),
                    $products->perPage(),
                    $products->currentPage(),
                    ['path' => $request->url(), 'query' => $request->query()]
                );
            }
        }

        $categories = Category::withCount('products')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->getTranslation('name') ?: (is_array($cat->name) ? ($cat->name['id'] ?? reset($cat->name)) : $cat->name),
                    'slug' => $cat->slug,
                    'parent_id' => $cat->parent_id,
                    'type' => $cat->type,
                    'icon' => $cat->icon,
                    'sort_order' => $cat->sort_order,
                    'products_count' => $cat->products_count,
                ];
            });

        return Inertia::render('shop/index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => array_values(ManageEquipmentBrands::getBrandOptions()),
            'filters' => [
                'q' => $request->input('q', ''),
                'category' => $request->input('category', ''),
                'series' => $request->input('series', ''),
                'brand' => $request->input('brand', ''),
                'sort' => $sort,
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $product = Product::active()
            ->forWebsite()
            ->where('slug', $slug)
            ->with(['variants', 'images', 'categories'])
            ->firstOrFail();

        $relatedProducts = Product::active()
            ->forWebsite()
            ->where('id', '!=', $product->id)
            ->where('series', $product->series)
            ->with(['variants', 'images'])
            ->take(4)
            ->get();

        return Inertia::render('shop/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'marketplaceDefaults' => [
                'tokopedia' => Setting::get('tokopedia', 'https://www.tokopedia.com/sanubariroastery'),
                'shopee' => Setting::get('shopee', 'https://shopee.co.id/sanubariroastery'),
            ],
        ]);
    }

    public function liveSearch(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));

        if (empty($q)) {
            $recommended = Product::active()
                ->forWebsite()
                ->where('is_featured', true)
                ->with(['variants', 'images'])
                ->take(4)
                ->get();

            return response()->json([
                'trending' => [
                    'Gunung Kawi Anaerobic',
                    'Espresso Houseblend',
                    'Gayo Wine Natural',
                    'Flores Bajawa',
                    'C.Y.B.R Custom Blend',
                    'V60 Pour Over',
                    'Drip Bag Kawi',
                ],
                'recommended' => $recommended,
                'products' => [],
                'guides' => [],
            ]);
        }

        $products = Product::active()
            ->forWebsite()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('tasting_notes', 'like', "%{$q}%")
                    ->orWhere('origin', 'like', "%{$q}%")
                    ->orWhere('process', 'like', "%{$q}%")
                    ->orWhere('series', 'like', "%{$q}%");
            })
            ->with(['variants', 'images'])
            ->take(8)
            ->get();

        $fixedBundles = FixedBundle::active()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            })
            ->with(['items.product.primaryImage', 'items.variant'])
            ->take(4)
            ->get()
            ->map(fn (FixedBundle $b) => $b->toProductCardArray());

        $bundles = EquipmentBundle::active()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            })
            ->with(['slots.category', 'slots.items.variant'])
            ->take(4)
            ->get()
            ->map(fn (EquipmentBundle $b) => $b->toProductCardArray());

        $guides = BrewGuide::where('title', 'like', "%{$q}%")
            ->orWhere('brew_method', 'like', "%{$q}%")
            ->take(3)
            ->get();

        return response()->json([
            'query' => $q,
            'products' => $fixedBundles->concat($bundles)->concat($products)->take(10)->values(),
            'guides' => $guides,
        ]);
    }
}
