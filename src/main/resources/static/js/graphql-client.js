/**
 * GraphQL Core Client Helper
 */

const GRAPHQL_ENDPOINT = '/graphql';

/**
 * Execute GraphQL Query or Mutation via AJAX POST
 * @param {string} query - GraphQL query/mutation string
 * @param {object} variables - Variables dictionary
 * @returns {Promise<any>} Response data object
 */
function executeGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: GRAPHQL_ENDPOINT,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                query: query,
                variables: variables
            }),
            dataType: 'json',
            success: function(response) {
                if (response.errors && response.errors.length > 0) {
                    console.error('GraphQL Errors:', response.errors);
                    reject(response.errors);
                } else {
                    resolve(response.data);
                }
            },
            error: function(xhr, status, error) {
                console.error('Network/Server Error:', xhr.responseText || error);
                reject(xhr);
            }
        });
    });
}

/**
 * Upload Image File helper (REST multipart) and get filename for GraphQL Input
 * @param {File} file 
 * @returns {Promise<string>} Uploaded filename
 */
function uploadImageFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        var formData = new FormData();
        formData.append('file', file);

        $.ajax({
            url: '/admin/upload/image', // Fallback or direct upload endpoint
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(res) {
                if (res && res.filename) {
                    resolve(res.filename);
                } else if (res && res.body) {
                    resolve(res.body);
                } else {
                    resolve(file.name);
                }
            },
            error: function() {
                // If endpoint doesn't support direct upload, fallback to filename or placeholder
                resolve(file.name);
            }
        });
    });
}

// Format Currency to VND
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

// Resolve Image URL
function resolveImageUrl(img, isCategory = false) {
    if (!img) {
        return isCategory ? '/uploads/default_category.png' : '/uploads/default_product.png';
    }
    if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
    }
    return isCategory ? '/admin/categories/images/' + img : '/admin/products/images/' + img;
}

// Global Toast notification using SweetAlert2
function showToast(icon, title) {
    if (typeof Swal === 'undefined') {
        alert(title);
        return;
    }
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
    Toast.fire({
        icon: icon,
        title: title
    });
}
