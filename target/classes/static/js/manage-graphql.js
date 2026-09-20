/**
 * Management Page Logic - CRUD & Pagination via GraphQL & AJAX
 */

// State Management
let currentProductPage = 0;
const productPageSize = 8;
let currentProductSearch = '';
let currentProductCategoryFilter = null;
let currentProductSortBy = 'productId';
let currentProductSortDir = 'desc';

let currentCategoryPage = 0;
const categoryPageSize = 8;
let currentCategorySearch = '';

let allCategoriesCache = [];

// ============================================================
// GRAPHQL QUERIES & MUTATIONS DEFINITION
// ============================================================

const GQL_PRODUCTS_PAGE = `
    query GetProductsPage($page: Int, $size: Int, $name: String, $categoryId: ID, $sortBy: String, $sortDir: String) {
        productsPage(page: $page, size: $size, name: $name, categoryId: $categoryId, sortBy: $sortBy, sortDir: $sortDir) {
            content {
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
            pageInfo {
                totalElements
                totalPages
                pageNumber
                pageSize
                isFirst
                isLast
                hasNext
                hasPrevious
            }
        }
    }
`;

const GQL_CATEGORIES_PAGE = `
    query GetCategoriesPage($page: Int, $size: Int, $name: String) {
        categoriesPage(page: $page, size: $size, name: $name) {
            content {
                categoryId
                categoryName
                icon
            }
            pageInfo {
                totalElements
                totalPages
                pageNumber
                pageSize
                isFirst
                isLast
                hasNext
                hasPrevious
            }
        }
    }
`;

const GQL_ALL_CATEGORIES = `
    query GetAllCategories {
        allCategories {
            categoryId
            categoryName
        }
    }
`;

const GQL_PRODUCT_BY_ID = `
    query GetProductById($id: ID!) {
        productById(id: $id) {
            productId
            productName
            unitPrice
            quantity
            discount
            images
            description
            status
            category {
                categoryId
                categoryName
            }
        }
    }
`;

const GQL_CATEGORY_BY_ID = `
    query GetCategoryById($id: ID!) {
        categoryById(id: $id) {
            categoryId
            categoryName
            icon
        }
    }
`;

const GQL_CREATE_PRODUCT = `
    mutation CreateProduct($input: ProductInput!) {
        createProduct(input: $input) {
            productId
            productName
        }
    }
`;

const GQL_UPDATE_PRODUCT = `
    mutation UpdateProduct($id: ID!, $input: ProductInput!) {
        updateProduct(id: $id, input: $input) {
            productId
            productName
        }
    }
`;

const GQL_DELETE_PRODUCT = `
    mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
    }
`;

const GQL_CREATE_CATEGORY = `
    mutation CreateCategory($input: CategoryInput!) {
        createCategory(input: $input) {
            categoryId
            categoryName
        }
    }
`;

const GQL_UPDATE_CATEGORY = `
    mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
        updateCategory(id: $id, input: $input) {
            categoryId
            categoryName
        }
    }
`;

const GQL_DELETE_CATEGORY = `
    mutation DeleteCategory($id: ID!) {
        deleteCategory(id: $id)
    }
`;

// ============================================================
// PRODUCT MANAGEMENT FUNCTIONS
// ============================================================

async function fetchAndRenderProducts() {
    const tbody = $('#productTableBody');
    tbody.html('<tr><td colspan="8" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Đang tải dữ liệu qua GraphQL...</td></tr>');

    try {
        const variables = {
            page: currentProductPage,
            size: productPageSize,
            name: currentProductSearch || null,
            categoryId: currentProductCategoryFilter || null,
            sortBy: currentProductSortBy,
            sortDir: currentProductSortDir
        };

        const data = await executeGraphQL(GQL_PRODUCTS_PAGE, variables);
        const pageData = data.productsPage;
        const products = pageData.content || [];
        const pageInfo = pageData.pageInfo;

        $('#statProductCount').text(pageInfo.totalElements);
        renderProductRows(products);
        renderProductPagination(pageInfo);

    } catch (err) {
        console.error('Lỗi khi tải trang Product qua GraphQL:', err);
        tbody.html('<tr><td colspan="8" class="text-center py-4 text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Lỗi nạp danh sách sản phẩm qua GraphQL</td></tr>');
    }
}

function renderProductRows(products) {
    const tbody = $('#productTableBody');
    tbody.empty();

    if (!products || products.length === 0) {
        tbody.html('<tr><td colspan="8" class="text-center py-4 text-muted"><i class="fas fa-box-open fa-2x mb-2 d-block"></i>Không tìm thấy sản phẩm nào</td></tr>');
        return;
    }

    products.forEach(p => {
        const imgSrc = resolveImageUrl(p.images, false);
        const finalPrice = p.unitPrice * (1 - (p.discount || 0) / 100);
        const categoryName = p.category ? p.category.categoryName : 'Chưa phân loại';
        const statusBadge = p.status === 1 
            ? '<span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1"><i class="fas fa-check-circle me-1"></i>Đang bán</span>'
            : '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-2 py-1"><i class="fas fa-pause-circle me-1"></i>Tạm dừng</span>';

        const discountTag = (p.discount && p.discount > 0)
            ? `<span class="badge bg-danger-subtle text-danger ms-1">-${p.discount}%</span>`
            : '';

        const tr = $(`
            <tr id="product-row-${p.productId}">
                <td class="fw-bold text-secondary">#${p.productId}</td>
                <td>
                    <img src="${imgSrc}" class="table-thumb rounded shadow-sm" alt="${p.productName}" 
                         onerror="this.onerror=null;this.src='https://placehold.co/60x60/3b82f6/ffffff?text=${encodeURIComponent(p.productName ? p.productName.charAt(0) : 'P')}';">
                </td>
                <td>
                    <div class="fw-bold text-dark">${p.productName}</div>
                    <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">${p.description || 'Không có mô tả'}</small>
                </td>
                <td>
                    <span class="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">${categoryName}</span>
                </td>
                <td>
                    <div class="fw-semibold text-dark">${formatVND(finalPrice)} ${discountTag}</div>
                    ${p.discount > 0 ? `<small class="text-decoration-line-through text-muted">${formatVND(p.unitPrice)}</small>` : ''}
                </td>
                <td>
                    <span class="fw-semibold ${p.quantity > 10 ? 'text-success' : 'text-danger'}">
                        ${p.quantity} cái
                    </span>
                </td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-circle me-1" title="Chỉnh sửa" onclick="openEditProductModal(${p.productId})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger rounded-circle" title="Xóa" onclick="deleteProductGraphQL(${p.productId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
        tbody.append(tr);
    });
}

function renderProductPagination(pageInfo) {
    const container = $('#productPagination');
    container.empty();

    if (!pageInfo || pageInfo.totalPages <= 1) {
        return;
    }

    const ul = $('<ul class="pagination pagination-sm mb-0 justify-content-end"></ul>');

    // Prev Button
    const prevDisabled = !pageInfo.hasPrevious ? 'disabled' : '';
    ul.append(`
        <li class="page-item ${prevDisabled}">
            <button class="page-link" onclick="goToProductPage(${pageInfo.pageNumber - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        </li>
    `);

    // Page numbers
    for (let i = 0; i < pageInfo.totalPages; i++) {
        const active = i === pageInfo.pageNumber ? 'active' : '';
        ul.append(`
            <li class="page-item ${active}">
                <button class="page-link" onclick="goToProductPage(${i})">${i + 1}</button>
            </li>
        `);
    }

    // Next Button
    const nextDisabled = !pageInfo.hasNext ? 'disabled' : '';
    ul.append(`
        <li class="page-item ${nextDisabled}">
            <button class="page-link" onclick="goToProductPage(${pageInfo.pageNumber + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </li>
    `);

    container.append(ul);
}

function goToProductPage(page) {
    currentProductPage = page;
    fetchAndRenderProducts();
}

// Modal Thêm Product Mới
function openCreateProductModal() {
    $('#addProductGqlForm')[0].reset();
    populateCategoryDropdownsInModals();
    $('#addProductGqlImagePreview').attr('src', 'https://placehold.co/100x100/e2e8f0/64748b?text=Preview');
    $('#createProductGqlModal').modal('show');
}

// Modal Chỉnh Sửa Product
async function openEditProductModal(id) {
    try {
        const data = await executeGraphQL(GQL_PRODUCT_BY_ID, { id: id });
        const prod = data.productById;
        if (!prod) {
            showToast('error', 'Không tìm thấy thông tin sản phẩm!');
            return;
        }

        populateCategoryDropdownsInModals();

        $('#edit_gql_productId').val(prod.productId);
        $('#edit_gql_productName').val(prod.productName);
        $('#edit_gql_unitPrice').val(prod.unitPrice);
        $('#edit_gql_discount').val(prod.discount);
        $('#edit_gql_quantity').val(prod.quantity);
        $('#edit_gql_status').val(prod.status);
        $('#edit_gql_description').val(prod.description);
        
        if (prod.category && prod.category.categoryId) {
            $('#edit_gql_categoryId').val(prod.category.categoryId);
        }

        const imgSrc = resolveImageUrl(prod.images, false);
        $('#editProductGqlImagePreview').attr('src', imgSrc);

        $('#editProductGqlModal').modal('show');

    } catch (err) {
        console.error('Lỗi khi lấy chi tiết Product:', err);
        showToast('error', 'Lỗi khi lấy thông tin sản phẩm qua GraphQL!');
    }
}

// Xóa Product qua GraphQL Mutation
function deleteProductGraphQL(id) {
    Swal.fire({
        title: 'Xác nhận xóa sản phẩm qua GraphQL?',
        text: 'Hành động này sẽ thực thi mutation deleteProduct(id: ' + id + ')!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-trash me-1"></i> Xóa ngay',
        cancelButtonText: 'Hủy'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const data = await executeGraphQL(GQL_DELETE_PRODUCT, { id: id });
                if (data.deleteProduct) {
                    showToast('success', 'Đã xóa sản phẩm thành công qua GraphQL Mutation!');
                    fetchAndRenderProducts();
                } else {
                    showToast('error', 'Xóa sản phẩm thất bại!');
                }
            } catch (err) {
                console.error('Lỗi khi xóa Product:', err);
                showToast('error', 'Lỗi khi thực thi mutation deleteProduct!');
            }
        }
    });
}

// ============================================================
// CATEGORY MANAGEMENT FUNCTIONS
// ============================================================

async function fetchAndRenderCategories() {
    const tbody = $('#categoryTableBody');
    tbody.html('<tr><td colspan="5" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-success me-2"></div>Đang tải danh mục qua GraphQL...</td></tr>');

    try {
        const variables = {
            page: currentCategoryPage,
            size: categoryPageSize,
            name: currentCategorySearch || null
        };

        const data = await executeGraphQL(GQL_CATEGORIES_PAGE, variables);
        const pageData = data.categoriesPage;
        const categories = pageData.content || [];
        const pageInfo = pageData.pageInfo;

        $('#statCategoryCount').text(pageInfo.totalElements);
        renderCategoryRows(categories);
        renderCategoryPagination(pageInfo);

    } catch (err) {
        console.error('Lỗi khi tải trang Category qua GraphQL:', err);
        tbody.html('<tr><td colspan="5" class="text-center py-4 text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Lỗi nạp danh mục qua GraphQL</td></tr>');
    }
}

function renderCategoryRows(categories) {
    const tbody = $('#categoryTableBody');
    tbody.empty();

    if (!categories || categories.length === 0) {
        tbody.html('<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-folder-open fa-2x mb-2 d-block"></i>Chưa có danh mục nào</td></tr>');
        return;
    }

    categories.forEach(cat => {
        const iconSrc = resolveImageUrl(cat.icon, true);
        const tr = $(`
            <tr id="category-row-${cat.categoryId}">
                <td class="fw-bold text-secondary">#${cat.categoryId}</td>
                <td>
                    <img src="${iconSrc}" class="category-icon-box rounded-circle shadow-sm" alt="${cat.categoryName}" 
                         onerror="this.onerror=null;this.src='https://placehold.co/50x50/4361ee/ffffff?text=${encodeURIComponent(cat.categoryName ? cat.categoryName.charAt(0) : 'C')}';">
                </td>
                <td>
                    <span class="fw-semibold text-dark">${cat.categoryName}</span>
                </td>
                <td>
                    <span class="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2 py-1">
                        <i class="fas fa-tag me-1"></i>Danh mục sản phẩm
                    </span>
                </td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-circle me-1" title="Chỉnh sửa" onclick="openEditCategoryModal(${cat.categoryId})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger rounded-circle" title="Xóa" onclick="deleteCategoryGraphQL(${cat.categoryId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
        tbody.append(tr);
    });
}

function renderCategoryPagination(pageInfo) {
    const container = $('#categoryPagination');
    container.empty();

    if (!pageInfo || pageInfo.totalPages <= 1) {
        return;
    }

    const ul = $('<ul class="pagination pagination-sm mb-0 justify-content-end"></ul>');

    // Prev Button
    const prevDisabled = !pageInfo.hasPrevious ? 'disabled' : '';
    ul.append(`
        <li class="page-item ${prevDisabled}">
            <button class="page-link" onclick="goToCategoryPage(${pageInfo.pageNumber - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        </li>
    `);

    // Page numbers
    for (let i = 0; i < pageInfo.totalPages; i++) {
        const active = i === pageInfo.pageNumber ? 'active' : '';
        ul.append(`
            <li class="page-item ${active}">
                <button class="page-link" onclick="goToCategoryPage(${i})">${i + 1}</button>
            </li>
        `);
    }

    // Next Button
    const nextDisabled = !pageInfo.hasNext ? 'disabled' : '';
    ul.append(`
        <li class="page-item ${nextDisabled}">
            <button class="page-link" onclick="goToCategoryPage(${pageInfo.pageNumber + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </li>
    `);

    container.append(ul);
}

function goToCategoryPage(page) {
    currentCategoryPage = page;
    fetchAndRenderCategories();
}

// Modal Thêm Category Mới
function openCreateCategoryModal() {
    $('#addCategoryGqlForm')[0].reset();
    $('#addCategoryGqlIconPreview').attr('src', 'https://placehold.co/100x100/e2e8f0/64748b?text=Preview');
    $('#createCategoryGqlModal').modal('show');
}

// Modal Sửa Category
async function openEditCategoryModal(id) {
    try {
        const data = await executeGraphQL(GQL_CATEGORY_BY_ID, { id: id });
        const cat = data.categoryById;
        if (!cat) {
            showToast('error', 'Không tìm thấy danh mục!');
            return;
        }

        $('#edit_gql_categoryId').val(cat.categoryId);
        $('#edit_gql_categoryName').val(cat.categoryName);
        $('#editCategoryGqlIconPreview').attr('src', resolveImageUrl(cat.icon, true));

        $('#editCategoryGqlModal').modal('show');

    } catch (err) {
        console.error('Lỗi khi lấy chi tiết Category:', err);
        showToast('error', 'Lỗi khi lấy thông tin danh mục qua GraphQL!');
    }
}

// Xóa Category qua GraphQL Mutation
function deleteCategoryGraphQL(id) {
    Swal.fire({
        title: 'Xác nhận xóa danh mục qua GraphQL?',
        text: 'Hành động này sẽ thực thi mutation deleteCategory(id: ' + id + ')!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-trash me-1"></i> Xóa ngay',
        cancelButtonText: 'Hủy'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const data = await executeGraphQL(GQL_DELETE_CATEGORY, { id: id });
                if (data.deleteCategory) {
                    showToast('success', 'Đã xóa danh mục thành công qua GraphQL Mutation!');
                    fetchAndRenderCategories();
                    refreshCategoriesCache();
                } else {
                    showToast('error', 'Xóa danh mục thất bại!');
                }
            } catch (err) {
                console.error('Lỗi khi xóa Category:', err);
                showToast('error', 'Lỗi khi thực thi mutation deleteCategory!');
            }
        }
    });
}

// ============================================================
// HELPER: Cập nhật Dropdown Danh mục trong Modals & Bộ lọc
// ============================================================

async function refreshCategoriesCache() {
    try {
        const data = await executeGraphQL(GQL_ALL_CATEGORIES);
        allCategoriesCache = data.allCategories || [];
        populateCategoryDropdownsInModals();
    } catch (err) {
        console.error('Lỗi nạp cache danh mục:', err);
    }
}

function populateCategoryDropdownsInModals() {
    const addSelect = $('#add_gql_categoryId');
    const editSelect = $('#edit_gql_categoryId');
    const filterSelect = $('#categoryFilterSelect');

    addSelect.empty().append('<option value="">-- Chọn danh mục --</option>');
    editSelect.empty().append('<option value="">-- Chọn danh mục --</option>');
    filterSelect.empty().append('<option value="">Tất cả danh mục</option>');

    allCategoriesCache.forEach(cat => {
        addSelect.append(`<option value="${cat.categoryId}">${cat.categoryName}</option>`);
        editSelect.append(`<option value="${cat.categoryId}">${cat.categoryName}</option>`);
        filterSelect.append(`<option value="${cat.categoryId}">${cat.categoryName}</option>`);
    });
}

// ============================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================

$(document).ready(function() {
    console.log('GraphQL Management Client Initialized...');

    // Nạp ban đầu
    refreshCategoriesCache();
    fetchAndRenderProducts();
    fetchAndRenderCategories();

    // Tab chuyển đổi
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
        const target = $(e.target).attr('data-bs-target');
        if (target === '#product-pane') {
            fetchAndRenderProducts();
        } else if (target === '#category-pane') {
            fetchAndRenderCategories();
        }
    });

    // Tìm kiếm Product có Debounce
    let productSearchTimeout = null;
    $('#productSearchInput').on('input', function() {
        clearTimeout(productSearchTimeout);
        currentProductSearch = $(this).val();
        currentProductPage = 0;
        productSearchTimeout = setTimeout(() => {
            fetchAndRenderProducts();
        }, 400);
    });

    // Lọc Product theo Category
    $('#categoryFilterSelect').on('change', function() {
        currentProductCategoryFilter = $(this).val() || null;
        currentProductPage = 0;
        fetchAndRenderProducts();
    });

    // Tìm kiếm Category có Debounce
    let categorySearchTimeout = null;
    $('#categorySearchInput').on('input', function() {
        clearTimeout(categorySearchTimeout);
        currentCategorySearch = $(this).val();
        currentCategoryPage = 0;
        categorySearchTimeout = setTimeout(() => {
            fetchAndRenderCategories();
        }, 400);
    });

    // Submit Thêm Product (GraphQL Mutation)
    $('#addProductGqlForm').on('submit', async function(e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Đang tạo...');

        const fileInput = document.getElementById('add_gql_productImageFile');
        let imageName = 'default_product.png';
        if (fileInput && fileInput.files && fileInput.files[0]) {
            imageName = await uploadImageFile(fileInput.files[0]);
        }

        const input = {
            productName: $('#add_gql_productName').val().trim(),
            unitPrice: parseFloat($('#add_gql_unitPrice').val()),
            quantity: parseInt($('#add_gql_quantity').val()) || 0,
            discount: parseFloat($('#add_gql_discount').val()) || 0,
            description: $('#add_gql_description').val().trim(),
            status: parseInt($('#add_gql_status').val()) || 1,
            categoryId: $('#add_gql_categoryId').val(),
            images: imageName
        };

        try {
            const data = await executeGraphQL(GQL_CREATE_PRODUCT, { input: input });
            if (data.createProduct) {
                $('#createProductGqlModal').modal('hide');
                showToast('success', `Đã thêm sản phẩm "${data.createProduct.productName}" qua GraphQL Mutation!`);
                fetchAndRenderProducts();
            }
        } catch (err) {
            console.error('Lỗi tạo sản phẩm:', err);
            showToast('error', 'Không thể tạo sản phẩm qua GraphQL Mutation!');
        } finally {
            submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Lưu sản phẩm');
        }
    });

    // Submit Sửa Product (GraphQL Mutation)
    $('#editProductGqlForm').on('submit', async function(e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Đang cập nhật...');

        const id = $('#edit_gql_productId').val();
        const fileInput = document.getElementById('edit_gql_productImageFile');
        let imageName = undefined;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            imageName = await uploadImageFile(fileInput.files[0]);
        }

        const input = {
            productName: $('#edit_gql_productName').val().trim(),
            unitPrice: parseFloat($('#edit_gql_unitPrice').val()),
            quantity: parseInt($('#edit_gql_quantity').val()) || 0,
            discount: parseFloat($('#edit_gql_discount').val()) || 0,
            description: $('#edit_gql_description').val().trim(),
            status: parseInt($('#edit_gql_status').val()) || 1,
            categoryId: $('#edit_gql_categoryId').val()
        };
        if (imageName) {
            input.images = imageName;
        }

        try {
            const data = await executeGraphQL(GQL_UPDATE_PRODUCT, { id: id, input: input });
            if (data.updateProduct) {
                $('#editProductGqlModal').modal('hide');
                showToast('success', `Cập nhật "${data.updateProduct.productName}" thành công qua GraphQL Mutation!`);
                fetchAndRenderProducts();
            }
        } catch (err) {
            console.error('Lỗi cập nhật sản phẩm:', err);
            showToast('error', 'Cập nhật sản phẩm thất bại qua GraphQL Mutation!');
        } finally {
            submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Cập nhật thay đổi');
        }
    });

    // Submit Thêm Category (GraphQL Mutation)
    $('#addCategoryGqlForm').on('submit', async function(e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Đang tạo...');

        const fileInput = document.getElementById('add_gql_categoryIconFile');
        let iconName = 'default_category.png';
        if (fileInput && fileInput.files && fileInput.files[0]) {
            iconName = await uploadImageFile(fileInput.files[0]);
        }

        const input = {
            categoryName: $('#add_gql_categoryName').val().trim(),
            icon: iconName
        };

        try {
            const data = await executeGraphQL(GQL_CREATE_CATEGORY, { input: input });
            if (data.createCategory) {
                $('#createCategoryGqlModal').modal('hide');
                showToast('success', `Thêm danh mục "${data.createCategory.categoryName}" thành công qua GraphQL!`);
                fetchAndRenderCategories();
                refreshCategoriesCache();
            }
        } catch (err) {
            console.error('Lỗi thêm danh mục:', err);
            showToast('error', 'Thêm danh mục thất bại qua GraphQL!');
        } finally {
            submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Lưu danh mục');
        }
    });

    // Submit Sửa Category (GraphQL Mutation)
    $('#editCategoryGqlForm').on('submit', async function(e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Đang cập nhật...');

        const id = $('#edit_gql_categoryId').val();
        const fileInput = document.getElementById('edit_gql_categoryIconFile');
        let iconName = undefined;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            iconName = await uploadImageFile(fileInput.files[0]);
        }

        const input = {
            categoryName: $('#edit_gql_categoryName').val().trim()
        };
        if (iconName) {
            input.icon = iconName;
        }

        try {
            const data = await executeGraphQL(GQL_UPDATE_CATEGORY, { id: id, input: input });
            if (data.updateCategory) {
                $('#editCategoryGqlModal').modal('hide');
                showToast('success', `Cập nhật danh mục "${data.updateCategory.categoryName}" thành công!`);
                fetchAndRenderCategories();
                refreshCategoriesCache();
            }
        } catch (err) {
            console.error('Lỗi cập nhật danh mục:', err);
            showToast('error', 'Cập nhật danh mục thất bại qua GraphQL!');
        } finally {
            submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Cập nhật thay đổi');
        }
    });

    // Preview Upload Images
    $('#add_gql_productImageFile').on('change', function() {
        if (this.files && this.files[0]) {
            const r = new FileReader();
            r.onload = e => $('#addProductGqlImagePreview').attr('src', e.target.result);
            r.readAsDataURL(this.files[0]);
        }
    });

    $('#edit_gql_productImageFile').on('change', function() {
        if (this.files && this.files[0]) {
            const r = new FileReader();
            r.onload = e => $('#editProductGqlImagePreview').attr('src', e.target.result);
            r.readAsDataURL(this.files[0]);
        }
    });

    $('#add_gql_categoryIconFile').on('change', function() {
        if (this.files && this.files[0]) {
            const r = new FileReader();
            r.onload = e => $('#addCategoryGqlIconPreview').attr('src', e.target.result);
            r.readAsDataURL(this.files[0]);
        }
    });

    $('#edit_gql_categoryIconFile').on('change', function() {
        if (this.files && this.files[0]) {
            const r = new FileReader();
            r.onload = e => $('#editCategoryGqlIconPreview').attr('src', e.target.result);
            r.readAsDataURL(this.files[0]);
        }
    });
});
