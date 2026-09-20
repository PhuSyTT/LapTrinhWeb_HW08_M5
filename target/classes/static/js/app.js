/**
 * Main Application JS
 */

// Global contextPath variable
var contextPath = "";

// Toast helper using SweetAlert2
function showToast(icon, title) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: icon,
        title: title
    });
}

$(document).ready(function() {
    console.log("Initializing Spring Boot RESTful API & AJAX Client...");
    
    // Load data for both modules
    loadCategories();
    loadProducts();

    // Tab switch triggers data reload if needed
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var targetTab = $(e.target).attr("data-bs-target");
        if (targetTab === '#category-pane') {
            loadCategories();
        } else if (targetTab === '#product-pane') {
            loadProducts();
        }
    });
});
