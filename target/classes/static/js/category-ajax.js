/**
 * Category AJAX Management
 */

// Load all categories via AJAX GET
function loadCategories() {
    $.ajax({
        url: contextPath + '/api/category',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            var categories = response.body || response;
            var tbody = $('#categoryTableBody');
            tbody.empty();

            if (!categories || categories.length === 0) {
                tbody.append('<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-box-open fa-2x mb-2 d-block"></i>Chưa có danh mục nào</td></tr>');
                $('#statCategoryCount').text(0);
                return;
            }

            $('#statCategoryCount').text(categories.length);
            
            // Populate category select dropdowns in Product modals & filters
            populateCategoryDropdowns(categories);

            categories.forEach(function(cat) {
                var iconSrc = cat.icon ? (cat.icon.startsWith('http') ? cat.icon : '/admin/categories/images/' + cat.icon) : '/uploads/default_category.png';
                var tr = $(`
                    <tr id="category-row-${cat.categoryId}">
                        <td class="fw-bold text-secondary">#${cat.categoryId}</td>
                        <td>
                            <img src="${iconSrc}" class="category-icon-box" alt="${cat.categoryName}" 
                                 onerror="this.onerror=null;this.src='https://placehold.co/50x50/4361ee/ffffff?text=${encodeURIComponent(cat.categoryName ? cat.categoryName.charAt(0) : 'C')}';">
                        </td>
                        <td>
                            <span class="fw-semibold text-dark">${cat.categoryName}</span>
                        </td>
                        <td>
                            <span class="badge badge-category">
                                <i class="fas fa-tag me-1"></i>Danh mục sản phẩm
                            </span>
                        </td>
                        <td>
                            <button type="button" class="btn-action btn-action-edit" title="Chỉnh sửa" onclick="showEditCategoryModal(${cat.categoryId})">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button type="button" class="btn-action btn-action-delete" title="Xóa" onclick="deleteCategory(${cat.categoryId})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
                tbody.append(tr);
            });
        },
        error: function(err) {
            console.error("Lỗi khi tải danh mục:", err);
            showToast('error', 'Không thể nạp danh sách danh mục!');
        }
    });
}

// Populate Category options in Product Modals & Product Filter
function populateCategoryDropdowns(categories) {
    var addSelect = $('#productCategoryId_add');
    var editSelect = $('#productCategoryId_edit');
    var filterSelect = $('#categoryFilterSelect');

    addSelect.empty().append('<option value="">-- Chọn danh mục --</option>');
    editSelect.empty().append('<option value="">-- Chọn danh mục --</option>');
    filterSelect.empty().append('<option value="">Tất cả danh mục</option>');

    categories.forEach(function(cat) {
        addSelect.append(`<option value="${cat.categoryId}">${cat.categoryName}</option>`);
        editSelect.append(`<option value="${cat.categoryId}">${cat.categoryName}</option>`);
        filterSelect.append(`<option value="${cat.categoryId}">${cat.categoryName}</option>`);
    });
}

// Show Create Category Modal
function showCreateCategoryModal() {
    $('#addCategoryForm')[0].reset();
    $('#addCategoryIconPreview').attr('src', 'https://placehold.co/100x100/e2e8f0/64748b?text=Preview');
    $('#createCategoryModal').modal('show');
}

// Show Edit Category Modal
function showEditCategoryModal(id) {
    $.ajax({
        url: contextPath + '/api/category/getCategory',
        type: 'POST',
        data: { id: id },
        dataType: 'json',
        success: function(response) {
            var cat = response.body || response;
            if (!cat) return;

            $('#edit_categoryId').val(cat.categoryId);
            $('#edit_categoryName').val(cat.categoryName);
            
            var iconSrc = cat.icon ? (cat.icon.startsWith('http') ? cat.icon : '/admin/categories/images/' + cat.icon) : 'https://placehold.co/100x100/e2e8f0/64748b?text=No+Icon';
            $('#editCategoryIconPreview').attr('src', iconSrc);

            $('#editCategoryModal').modal('show');
        },
        error: function(xhr) {
            showToast('error', 'Không thể lấy thông tin danh mục!');
        }
    });
}

// Delete Category via AJAX DELETE
function deleteCategory(id) {
    Swal.fire({
        title: 'Xác nhận xóa danh mục?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-trash me-1"></i> Xóa ngay',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: contextPath + '/api/category/deleteCategory?categoryId=' + id,
                type: 'DELETE',
                dataType: 'json',
                success: function(res) {
                    $('#category-row-' + id).fadeOut('slow', function() {
                        $(this).remove();
                        loadCategories();
                        loadProducts();
                    });
                    showToast('success', 'Đã xóa danh mục thành công!');
                },
                error: function(xhr) {
                    var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Xóa danh mục thất bại!';
                    showToast('error', msg);
                }
            });
        }
    });
}

// Document Ready for Category event handlers
$(document).ready(function() {
    // Add Category Form Submit via AJAX POST
    $('#addCategoryForm').submit(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        var submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<span class="loading-spinner"></span> Đang lưu...');

        $.ajax({
            url: contextPath + '/api/category/addCategory',
            type: 'POST',
            data: formData,
            dataType: 'json',
            contentType: false,
            processData: false,
            cache: false,
            success: function(response) {
                $('#createCategoryModal').modal('hide');
                showToast('success', response.message || 'Thêm danh mục thành công!');
                loadCategories();
            },
            error: function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Thêm danh mục thất bại!';
                showToast('error', msg);
            },
            complete: function() {
                submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Lưu danh mục');
            }
        });
    });

    // Edit Category Form Submit via AJAX PUT
    $('#editCategoryForm').submit(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        var submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<span class="loading-spinner"></span> Đang cập nhật...');

        $.ajax({
            url: contextPath + '/api/category/updateCategory',
            type: 'PUT',
            data: formData,
            dataType: 'json',
            contentType: false,
            processData: false,
            cache: false,
            success: function(response) {
                $('#editCategoryModal').modal('hide');
                showToast('success', response.message || 'Cập nhật danh mục thành công!');
                loadCategories();
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

    // Preview uploaded icon in Add Category Modal
    $('#add_categoryIcon').change(function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#addCategoryIconPreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Preview uploaded icon in Edit Category Modal
    $('#edit_categoryIcon').change(function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#editCategoryIconPreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Live search for category table
    $('#categorySearchInput').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        $('#categoryTableBody tr').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
});
