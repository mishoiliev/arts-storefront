import { expect, type Locator, test } from '@playwright/test';

async function chooseCatalogOption(catalog: Locator, controlName: string, optionName: RegExp) {
  await catalog.getByRole('button', { name: new RegExp(`^${controlName}:`) }).click();
  await catalog
    .getByRole('menu', { name: `${controlName} options` })
    .getByRole('menuitemradio', { name: optionName })
    .click();
}

test.describe('catalogue discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#collection');
    await expect(
      page.getByRole('region', { name: 'The collection' }).getByTestId('product-card').first()
    ).toBeVisible();
  });

  test('searches products and clears the active query', async ({ page }) => {
    const catalog = page.getByRole('region', { name: 'The collection' });
    const firstTitle = await catalog
      .getByTestId('product-card')
      .first()
      .getByRole('heading', { level: 3 })
      .innerText();

    await catalog.getByRole('searchbox', { name: 'Search products' }).fill(firstTitle);
    await catalog.getByRole('button', { name: 'Search products' }).click();

    await expect(page).toHaveURL(/\?q=/);
    await expect(page.getByRole('heading', { level: 3, name: firstTitle })).toBeVisible();

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page).not.toHaveURL(/\?q=/);
  });

  test('filters by category, price and availability', async ({ page }) => {
    const catalog = page.getByRole('region', { name: 'The collection' });
    await catalog.getByRole('button', { name: /^Category:/ }).click();
    const categoryOption = catalog
      .getByRole('menu', { name: 'Category options' })
      .getByRole('menuitemradio')
      .nth(1);
    const category = await categoryOption.getAttribute('data-value');
    expect(category).toBeTruthy();

    await categoryOption.click();
    await expect(page).toHaveURL(/category=/);
    const categoryCards = catalog.getByTestId('product-card');
    await expect(categoryCards.first()).toHaveAttribute('data-category', category!);
    expect(
      await categoryCards.evaluateAll(
        (cards, expectedCategory) =>
          cards.every((card) => card.getAttribute('data-category') === expectedCategory),
        category
      )
    ).toBe(true);

    await chooseCatalogOption(catalog, 'Category', /^All categories/);
    await chooseCatalogOption(catalog, 'Price', /^Under \$25$/);
    await expect(page).toHaveURL(/price=under-25/);
    expect(
      await catalog
        .getByTestId('product-card')
        .evaluateAll((cards) => cards.every((card) => Number(card.getAttribute('data-price')) < 25))
    ).toBe(true);

    await chooseCatalogOption(catalog, 'Price', /^Any price$/);
    await chooseCatalogOption(catalog, 'Availability', /^In stock$/);
    await expect(page).toHaveURL(/availability=in-stock/);
    expect(
      await catalog
        .getByTestId('product-card')
        .evaluateAll((cards) =>
          cards.every((card) => card.getAttribute('data-in-stock') === 'true')
        )
    ).toBe(true);
  });

  test('sorts, changes page size and paginates', async ({ page }) => {
    const catalog = page.getByRole('region', { name: 'The collection' });
    await chooseCatalogOption(catalog, 'Products per page', /^12 products$/);
    await expect(page).toHaveURL(/perPage=12/);
    await expect(catalog.getByTestId('product-card')).toHaveCount(12);

    await chooseCatalogOption(catalog, 'Sort products', /^Price: low to high$/);
    await expect(page).toHaveURL(/sort=price-asc/);
    const prices = await catalog
      .getByTestId('product-card')
      .evaluateAll((cards) => cards.map((card) => Number(card.getAttribute('data-price'))));
    expect(prices).toEqual([...prices].sort((left, right) => left - right));

    const firstProduct = await catalog
      .getByTestId('product-card')
      .first()
      .getAttribute('data-product-id');
    await page.getByRole('link', { name: /next/i }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText('Page 2 of', { exact: false })).toBeVisible();
    await expect(catalog.getByTestId('product-card').first()).not.toHaveAttribute(
      'data-product-id',
      firstProduct!
    );
  });

  test('supports keyboard navigation in filter menus', async ({ page }) => {
    const catalog = page.getByRole('region', { name: 'The collection' });
    const categoryTrigger = catalog.getByRole('button', {
      name: /^Category:/,
    });

    await categoryTrigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(catalog.getByRole('menu', { name: 'Category options' })).toBeVisible();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/category=beauty/);
    await expect(categoryTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('zooms immediately, then rotates catalogue images after a short delay', async ({ page }) => {
    const media = page
      .getByRole('region', { name: 'The collection' })
      .locator('[data-testid="product-card-media"]:not([data-image-count="1"])')
      .first();
    const firstImageSource = await media.getAttribute('data-active-image-src');

    await expect(media).toHaveAttribute('data-active-image', '0');
    await expect(media).toHaveAttribute('data-crossfade', 'true');
    await expect(media.locator('img')).toHaveCount(1);
    await media.hover();
    await expect(media).toHaveAttribute('data-zoomed', 'true');
    expect(await media.locator('img').count()).toBeGreaterThan(1);

    await page.waitForTimeout(250);
    await expect(media).toHaveAttribute('data-active-image', '0');

    await expect(media).toHaveAttribute('data-active-image', '1', {
      timeout: 800,
    });
    await expect(media).not.toHaveAttribute('data-active-image-src', firstImageSource!);
    await page.waitForTimeout(1_200);
    await expect(media).toHaveAttribute('data-active-image', '1');
    await expect(media).not.toHaveAttribute('data-active-image', '1', {
      timeout: 900,
    });

    await page.getByRole('heading', { level: 2, name: 'The collection' }).hover();
    await expect(media).toHaveAttribute('data-active-image', '0');
    await expect(media).toHaveAttribute('data-zoomed', 'false');
  });

  test('keeps single-image cards static while preserving the hover zoom', async ({ page }) => {
    const media = page
      .getByRole('region', { name: 'The collection' })
      .locator('[data-testid="product-card-media"][data-image-count="1"]')
      .first();

    await expect(media).toHaveAttribute('data-crossfade', 'false');
    await expect(media.locator('img')).not.toHaveClass(/transition-opacity/);
    await media.hover();
    await expect(media).toHaveAttribute('data-zoomed', 'true');
    await page.waitForTimeout(2_600);
    await expect(media).toHaveAttribute('data-active-image', '0');
  });
});

test('renders a single product image without carousel controls', async ({ page }) => {
  await page.goto('/?perPage=48#collection');
  const productMedia = page
    .locator('[data-testid="product-card-media"][data-detail-image-count="1"]')
    .first();
  await expect(productMedia).toBeVisible();
  await productMedia.click();

  await expect(page.getByTestId('product-image')).toBeVisible();
  await expect(page.getByTestId('product-gallery')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Previous product image' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /View product image/ })).toHaveCount(0);
});

test('uses the product gallery, adds an item, and exposes the cart', async ({ page }) => {
  await page.goto('/?availability=in-stock&perPage=48#collection');
  const productMedia = page
    .locator('[data-testid="product-card-media"]:not([data-detail-image-count="1"])')
    .first();
  await expect(productMedia).toBeVisible();
  await productMedia.click();

  const gallery = page.getByTestId('product-gallery');
  await expect(gallery).toHaveAttribute('data-active-image', '0');
  await page.getByRole('button', { name: 'Next product image' }).click();
  await expect(gallery).toHaveAttribute('data-active-image', '1');

  const thumbnails = page.getByRole('button', { name: /View product image/ });
  expect(await thumbnails.count()).toBeGreaterThan(1);
  await thumbnails.first().click();
  await expect(gallery).toHaveAttribute('data-active-image', '0');

  await page.getByRole('button', { name: /^Add .* to cart$/ }).click();
  await expect(page.getByRole('button', { name: 'Cart with 1 item' })).toBeVisible();
  await page.getByRole('button', { name: 'Cart with 1 item' }).click();
  await expect(page.getByRole('region', { name: 'Cart overview' })).toBeVisible();
});

test('renders the custom not-found state for an invalid product', async ({ page }) => {
  await page.goto('/products/not-a-product');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nothing on this shelf.' })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to the collection' })).toBeVisible();
});

test('keeps the cart action visible on short viewports', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 375 });
  await page.goto('/?availability=in-stock&perPage=48#collection');

  for (let index = 0; index < 3; index += 1) {
    await page
      .getByRole('button', { name: /^Add .* to cart$/ })
      .first()
      .click();
  }

  await page.getByRole('button', { name: 'Cart with 3 items' }).click();
  const overview = page.getByRole('region', { name: 'Cart overview' });
  const goToCart = overview.getByRole('link', { name: 'Go to cart' });

  await expect(overview).toBeVisible();
  await expect(goToCart).toBeInViewport();
});

test('keeps the cart usable when session storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() {
        throw new DOMException('Storage is blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/#collection');

  await page
    .getByRole('button', { name: /^Add .* to cart$/ })
    .first()
    .click();

  await expect(page.getByRole('button', { name: 'Cart with 1 item' })).toBeVisible();
});
