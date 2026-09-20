/**
 * Home Page Logic - Powered by GraphQL & AJAX
 */

let allCategoriesList = [];
let currentSelectedCategoryId = null;

// ==========================================
// 1. LẤY TẤT CẢ PRODUCT THEO 1 CATEGORY
// ==========================================

const QUERY_ALL_CATEGORIES = `
    query GetAllCategories {
        allCategories {
            categoryId
            categoryName
            icon
        }
    }
`;

const QUERY_PRODUCTS_BY_CATEGORY = `
    query GetProductsByCategory($categoryId: ID!) {
        productsByCategory(categoryId: $categoryId) {
            productId
            productName
            unitPrice
            quantity
            discount
            images
            description
            status
            createDate
            category {
                categoryId
                categoryName
            }
        }
    }
`;

// ==========================================
// 2. HIỂN THỊ TẤT CẢ PRODUCT GIÁ TỪ THẤP ĐẾN CAO
// ==========================================

const QUERY_PRODUCTS_SORTED_BY_PRICE = `
    query GetProductsSortedByPrice($ascending: Boolean) {
        productsSortedByPrice(ascending: $ascending) {
            productId
            productName
            unitPrice
            quantity
            discount
            images
            description
            status
            createDate
            category {
                categoryId
                categoryName
            }
        }
    }
`;

// Tải danh mục và khởi tạo Category Pills
async function loadCategoriesForHome() {
    try {
        const data = await executeGraphQL(QUERY_ALL_CATEGORIES);
        allCategoriesList = data.allCategories || [];
        
        const pillsContainer = $('#categoryPillsContainer');
        pillsContainer.empty();

        if (allCategoriesList.length === 0) {
            pillsContainer.html('<div class="text-muted">Chưa có danh mục nào</div>');
            return;
        }

        // Tạo nút cho từng Category
        allCategoriesList.forEach((cat, index) => {
            const isActive = index === 0 ? 'active' : '';
            if (index === 0) {
                currentSelectedCategoryId = cat.categoryId;
            }

            const pill = $(`
                <button type="button" class="btn category-pill ${isActive}" data-category-id="${cat.categoryId}">
                    <i class="fas fa-tag me-1"></i> ${cat.categoryName}
                </button>
            `);

            pill.on('click', function() {
                $('.category-pill').removeClass('active');
                $(this).addClass('active');
                currentSelectedCategoryId = cat.categoryId;
                loadProductsByCategory(cat.categoryId, cat.categoryName);
            });

            pillsContainer.append(pill);
        });

        // Tải sản phẩm của danh mục đầu tiên
        if (currentSelectedCategoryId) {
            loadProductsByCategory(currentSelectedCategoryId, allCategoriesList[0].categoryName);
        }

    } catch (err) {
        console.error('Lỗi khi tải danh mục trang Home:', err);
    }
}

// Gọi GraphQL lấy danh sách sản phẩm theo 1 Category
async function loadProductsByCategory(categoryId, categoryName) {
    const grid = $('#categoryProductsGrid');
    const titleEl = $('#selectedCategoryTitle');
    
    if (categoryName) {
        titleEl.html(`<i class="fas fa-folder-open text-primary me-2"></i>Danh mục: <span class="text-primary">${categoryName}</span>`);
    }

    grid.html(`
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Đang nạp sản phẩm của danh mục qua GraphQL...</p>
        </div>
    `);

    try {
        const data = await executeGraphQL(QUERY_PRODUCTS_BY_CATEGORY, { categoryId: categoryId });
        const products = data.productsByCategory || [];
        renderProductCards(grid, products, 'Không có sản phẩm nào thuộc danh mục này.');
    } catch (err) {
        console.error('Lỗi khi lấy sản phẩm theo Category:', err);
        grid.html(`
            <div class="col-12 text-center py-4 text-danger">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <p>Không thể tải sản phẩm của danh mục này qua GraphQL!</p>
            </div>
        `);
    }
}

// Gọi GraphQL lấy tất cả sản phẩm sắp xếp giá từ thấp đến cao (hoặc cao đến thấp)
async function loadProductsSortedByPrice(ascending = true) {
    const grid = $('#sortedPriceProductsGrid');
    grid.html(`
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-success" role="status"></div>
            <p class="text-muted mt-2">Đang truy vấn sản phẩm sắp xếp theo giá qua GraphQL...</p>
        </div>
    `);

    try {
        const data = await executeGraphQL(QUERY_PRODUCTS_SORTED_BY_PRICE, { ascending: ascending });
        const products = data.productsSortedByPrice || [];
        renderProductCards(grid, products, 'Không tìm thấy sản phẩm nào trong hệ thống.');
    } catch (err) {
        console.error('Lỗi khi lấy sản phẩm sắp xếp theo giá:', err);
        grid.html(`
            <div class="col-12 text-center py-4 text-danger">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <p>Không thể tải danh sách sản phẩm theo giá qua GraphQL!</p>
            </div>
        `);
    }
}

// Render danh sách thẻ Product Card
function renderProductCards(container, products, emptyMessage) {
    container.empty();

    if (!products || products.length === 0) {
        container.html(`
            <div class="col-12 text-center py-5 text-muted">
                <i class="fas fa-box-open fa-3x mb-3 text-secondary opacity-50"></i>
                <h5>${emptyMessage}</h5>
            </div>
        `);
        return;
    }

    products.forEach(p => {
        const imgSrc = resolveImageUrl(p.images, false);
        const finalPrice = p.unitPrice * (1 - (p.discount || 0) / 100);
        const catName = p.category ? p.category.categoryName : 'Chưa phân loại';
        
        const discountBadge = (p.discount && p.discount > 0) 
            ? `<span class="product-badge-discount">-${p.discount}%</span>` 
            : '';

        const card = $(`
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="product-showcase-card h-100">
                    <div class="card-img-wrapper">
                        ${discountBadge}
                        <img src="${imgSrc}" class="product-card-img" alt="${p.productName}"
                             onerror="this.onerror=null;this.src='https://placehold.co/300x200/4361ee/ffffff?text=${encodeURIComponent(p.productName ? p.productName.charAt(0) : 'P')}';">
                        <div class="card-img-overlay-hover">
                            <button class="btn btn-sm btn-light rounded-pill px-3 shadow" onclick='openQuickViewModal(${JSON.stringify(p).replace(/'/g, "&apos;")})'>
                                <i class="fas fa-eye me-1"></i> Xem chi tiết
                            </button>
                        </div>
                    </div>
                    <div class="card-body-content p-3 d-flex flex-column">
                        <span class="category-tag mb-1"><i class="fas fa-layer-group me-1"></i>${catName}</span>
                        <h6 class="product-name-title" title="${p.productName}">${p.productName}</h6>
                        <p class="product-desc-text small text-muted mb-3 flex-grow-1">${p.description || 'Chưa có mô tả chi tiết'}</p>
                        
                        <div class="price-row d-flex align-items-baseline justify-content-between mt-auto">
                            <div>
                                <span class="final-price text-primary fw-bold fs-5">${formatVND(finalPrice)}</span>
                                ${p.discount > 0 ? `<span class="original-price text-muted text-decoration-line-through small ms-1">${formatVND(p.unitPrice)}</span>` : ''}
                            </div>
                            <span class="badge ${p.quantity > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill">
                                ${p.quantity > 0 ? `Còn ${p.quantity}` : 'Hết hàng'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `);

        container.append(card);
    });
}

// Modal Xem Nhanh Sản Phẩm
function openQuickViewModal(product) {
    if (!product) return;
    const finalPrice = product.unitPrice * (1 - (product.discount || 0) / 100);
    const catName = product.category ? product.category.categoryName : 'Chưa phân loại';

    $('#qv_productName').text(product.productName);
    $('#qv_categoryName').text(catName);
    $('#qv_unitPrice').text(formatVND(finalPrice));
    
    if (product.discount > 0) {
        $('#qv_originalPrice').text(formatVND(product.unitPrice)).show();
        $('#qv_discountBadge').text(`Tiết kiệm ${product.discount}%`).show();
    } else {
        $('#qv_originalPrice').hide();
        $('#qv_discountBadge').hide();
    }

    $('#qv_quantity').text(product.quantity);
    $('#qv_description').text(product.description || 'Chưa có mô tả chi tiết.');
    $('#qv_image').attr('src', resolveImageUrl(product.images, false));

    $('#quickViewModal').modal('show');
}

// Khởi chạy khi tài liệu đã sẵn sàng
$(document).ready(function() {
    console.log('GraphQL Home Client Initialized...');

    // Nạp Categories và Products theo Category
    loadCategoriesForHome();

    // Nạp Products sắp xếp giá từ thấp đến cao (Mặc định Ascending = true)
    loadProductsSortedByPrice(true);

    // Event khi đổi kiểu sắp xếp giá
    $('#sortPriceOrderSelect').on('change', function() {
        const isAsc = $(this).val() === 'asc';
        loadProductsSortedByPrice(isAsc);
    });
});
