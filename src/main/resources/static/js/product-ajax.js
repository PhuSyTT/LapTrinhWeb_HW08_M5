/**
 * Product AJAX Management
 */

var allProductsData = [];

// Format currency in VND
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

// Load all products via AJAX GET
function loadProducts() {
    $.ajax({
        url: contextPath + '/api/product',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            var products = response.body || response;
            allProductsData = products || [];
            renderProductTable(allProductsData);
            updateProductStats(allProductsData);
        },
        error: function(err) {
            console.error("Lỗi khi tải sản phẩm:", err);
            showToast('error', 'Không thể nạp danh sách sản phẩm!');
        }
    });
}

// Update Dashboard Statistics
function updateProductStats(products) {
    $('#statProductCount').text(products.length);
    var totalStock = 0;
    var discountCount = 0;

    products.forEach(function(p) {
        totalStock += (p.quantity || 0);
        if (p.discount && p.discount > 0) {
            discountCount++;
        }
    });

    $('#statTotalStock').text(totalStock);
    $('#statDiscountCount').text(discountCount);
}

// Render Product Table rows
function renderProductTable(products) {
    var tbody = $('#productTableBody');
    tbody.empty();

    if (!products || products.length === 0) {
        tbody.append('<tr><td colspan="8" class="text-center py-4 text-muted"><i class="fas fa-box-open fa-2x mb-2 d-block"></i>Không tìm thấy sản phẩm nào</td></tr>');
        return;
    }

    products.forEach(function(p) {
        var imgSrc = p.images ? (p.images.startsWith('http') ? p.images : '/admin/products/images/' + p.images) : '/uploads/default_product.png';
        var finalPrice = p.unitPrice * (1 - (p.discount || 0) / 100);
        var categoryName = p.category ? p.category.categoryName : 'Chưa phân loại';
        var statusBadge = p.status === 1 
            ? '<span class="badge badge-status-active"><i class="fas fa-check-circle me-1"></i>Đang bán</span>'
            : '<span class="badge badge-status-inactive"><i class="fas fa-pause-circle me-1"></i>Tạm dừng</span>';

        var discountTag = (p.discount && p.discount > 0)
            ? `<span class="discount-badge">-${p.discount}%</span>`
            : '';

        var tr = $(`
            <tr id="product-row-${p.productId}">
                <td class="fw-bold text-secondary">#${p.productId}</td>
                <td>
                    <img src="${imgSrc}" class="table-thumb" alt="${p.productName}" 
                         onerror="this.onerror=null;this.src='https://placehold.co/60x60/3b82f6/ffffff?text=${encodeURIComponent(p.productName ? p.productName.charAt(0) : 'P')}';">
                </td>
                <td>
                    <div class="fw-bold text-dark">${p.productName}</div>
                    <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">${p.description || 'Không có mô tả'}</small>
                </td>
                <td>
                    <span class="badge badge-category">${categoryName}</span>
                </td>
                <td>
                    <div class="price-regular">${formatCurrency(finalPrice)} ${discountTag}</div>
                    ${p.discount > 0 ? `<small class="text-decoration-line-through text-muted">${formatCurrency(p.unitPrice)}</small>` : ''}
                </td>
                <td>
                    <span class="fw-semibold ${p.quantity > 10 ? 'text-success' : 'text-danger'}">
                        ${p.quantity} cái
                    </span>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <button type="button" class="btn-action btn-action-edit" title="Chỉnh sửa" onclick="showEditProductModal(${p.productId})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" class="btn-action btn-action-delete" title="Xóa" onclick="deleteProduct(${p.productId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
        tbody.append(tr);
    });
}

// Show Create Product Modal
function showCreateProductModal() {
    $('#addProductForm')[0].reset();
    $('#addProductImagePreview').attr('src', 'https://placehold.co/100x100/e2e8f0/64748b?text=Preview');
    $('#createProductModal').modal('show');
}

// Show Edit Product Modal
function showEditProductModal(id) {
    $.ajax({
        url: contextPath + '/api/product/getProduct',
        type: 'POST',
        data: { id: id },
        dataType: 'json',
        success: function(response) {
            var prod = response.body || response;
            if (!prod) return;

            $('#edit_productId').val(prod.productId);
            $('#edit_productName').val(prod.productName);
            $('#edit_productUnitPrice').val(prod.unitPrice);
            $('#edit_productDiscount').val(prod.discount);
            $('#edit_productQuantity').val(prod.quantity);
            $('#edit_productStatus').val(prod.status);
            $('#edit_productDescription').val(prod.description);
            
            if (prod.category && prod.category.categoryId) {
                $('#productCategoryId_edit').val(prod.category.categoryId);
            }

            var imgSrc = prod.images ? (prod.images.startsWith('http') ? prod.images : '/admin/products/images/' + prod.images) : 'https://placehold.co/100x100/e2e8f0/64748b?text=No+Image';
            $('#editProductImagePreview').attr('src', imgSrc);

            $('#editProductModal').modal('show');
        },
        error: function(xhr) {
            showToast('error', 'Không thể lấy thông tin sản phẩm!');
        }
    });
}

// Delete Product via AJAX DELETE
function deleteProduct(id) {
    Swal.fire({
        title: 'Xác nhận xóa sản phẩm?',
        text: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-trash me-1"></i> Xóa ngay',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: contextPath + '/api/product/deleteProduct?productId=' + id,
                type: 'DELETE',
                dataType: 'json',
                success: function(res) {
                    $('#product-row-' + id).fadeOut('slow', function() {
                        $(this).remove();
                        loadProducts();
                    });
                    showToast('success', 'Đã xóa sản phẩm thành công!');
                },
                error: function(xhr) {
                    var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Xóa sản phẩm thất bại!';
                    showToast('error', msg);
                }
            });
        }
    });
}

// Document Ready for Product event handlers
$(document).ready(function() {
    // Add Product Form Submit via AJAX POST
    $('#addProductForm').submit(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        var submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<span class="loading-spinner"></span> Đang lưu...');

        $.ajax({
            url: contextPath + '/api/product/addProduct',
            type: 'POST',
            data: formData,
            dataType: 'json',
            contentType: false,
            processData: false,
            cache: false,
            success: function(response) {
                $('#createProductModal').modal('hide');
                showToast('success', response.message || 'Thêm sản phẩm thành công!');
                loadProducts();
            },
            error: function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Thêm sản phẩm thất bại!';
                showToast('error', msg);
            },
            complete: function() {
                submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Lưu sản phẩm');
            }
        });
    });

    // Edit Product Form Submit via AJAX PUT
    $('#editProductForm').submit(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        var submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<span class="loading-spinner"></span> Đang cập nhật...');

        $.ajax({
            url: contextPath + '/api/product/updateProduct',
            type: 'PUT',
            data: formData,
            dataType: 'json',
            contentType: false,
            processData: false,
            cache: false,
            success: function(response) {
                $('#editProductModal').modal('hide');
                showToast('success', response.message || 'Cập nhật sản phẩm thành công!');
                loadProducts();
            },
            error: function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Cập nhật thất bại!';
                showToast('error', msg);
            },
            complete: function() {
                submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Cập nhật thay đổi');
            }
        });
    });

    // Preview uploaded image in Add Product Modal
    $('#add_productImage').change(function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#addProductImagePreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Preview uploaded image in Edit Product Modal
    $('#edit_productImage').change(function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#editProductImagePreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Search and Category Filter triggers
    $('#productSearchInput, #categoryFilterSelect').on('input change', function() {
        var keyword = $('#productSearchInput').val().toLowerCase().trim();
        var selectedCat = $('#categoryFilterSelect').val();

        var filtered = allProductsData.filter(function(p) {
            var matchName = p.productName.toLowerCase().indexOf(keyword) > -1 ||
                            (p.description && p.description.toLowerCase().indexOf(keyword) > -1);
            var matchCategory = !selectedCat || (p.category && p.category.categoryId == selectedCat);
            return matchName && matchCategory;
        });

        renderProductTable(filtered);
    });
});
