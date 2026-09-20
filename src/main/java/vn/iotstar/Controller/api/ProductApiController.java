package vn.iotstar.Controller.api;

import java.sql.Timestamp;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import vn.iotstar.entity.Category;
import vn.iotstar.entity.Product;
import vn.iotstar.model.Response;
import vn.iotstar.service.ICategoryService;
import vn.iotstar.service.IProductService;
import vn.iotstar.service.IStorageService;

@RestController
@RequestMapping(path = "/api/product")
@Tag(name = "Product API", description = "Các API thao tác CRUD cho Product")
public class ProductApiController {

    @Autowired
    private IProductService productService;

    @Autowired
    private ICategoryService categoryService;

    @Autowired
    private IStorageService storageService;

    @GetMapping
    @Operation(summary = "Lấy tất cả sản phẩm")
    public ResponseEntity<?> getAllProduct() {
        return new ResponseEntity<Response>(
                new Response(true, "Thành công", productService.findAll()), 
                HttpStatus.OK);
    }

    @PostMapping(path = "/getProduct")
    @Operation(summary = "Lấy chi tiết Product theo ID (POST)")
    public ResponseEntity<?> getProduct(@Validated @RequestParam("id") Long id) {
        Optional<Product> optProduct = productService.findById(id);
        if (optProduct.isPresent()) {
            return new ResponseEntity<Response>(
                    new Response(true, "Thành công", optProduct.get()), 
                    HttpStatus.OK);
        } else {
            return new ResponseEntity<Response>(
                    new Response(false, "Không tìm thấy sản phẩm", null), 
                    HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(path = "/{id}")
    @Operation(summary = "Lấy chi tiết Product theo ID (GET)")
    public ResponseEntity<?> getProductById(@PathVariable("id") Long id) {
        Optional<Product> optProduct = productService.findById(id);
        if (optProduct.isPresent()) {
            return new ResponseEntity<Response>(
                    new Response(true, "Thành công", optProduct.get()), 
                    HttpStatus.OK);
        } else {
            return new ResponseEntity<Response>(
                    new Response(false, "Không tìm thấy sản phẩm", null), 
                    HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(path = "/addProduct", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Thêm mới Product (Form-data có tải file ảnh)")
    public ResponseEntity<?> addProduct(
            @Validated @RequestParam("productName") String productName,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @Validated @RequestParam("unitPrice") Double unitPrice,
            @RequestParam(value = "discount", defaultValue = "0") Double discount,
            @RequestParam(value = "description", defaultValue = "") String description,
            @Validated @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "quantity", defaultValue = "0") Integer quantity,
            @RequestParam(value = "status", defaultValue = "1") Short status) {

        Optional<Product> optProduct = productService.findByProductName(productName);
        if (optProduct.isPresent()) {
            return new ResponseEntity<Response>(
                    new Response(false, "Sản phẩm này đã tồn tại trong hệ thống", optProduct.get()), 
                    HttpStatus.BAD_REQUEST);
        }

        Product product = new Product();
        product.setProductName(productName);
        product.setUnitPrice(unitPrice);
        product.setDiscount(discount != null ? discount : 0.0);
        product.setDescription(description != null ? description : "");
        product.setQuantity(quantity != null ? quantity : 0);
        product.setStatus(status != null ? status : 1);
        product.setCreateDate(new Timestamp(new Date().getTime()));

        // Gán Category
        Optional<Category> optCategory = categoryService.findById(categoryId);
        if (optCategory.isPresent()) {
            product.setCategory(optCategory.get());
        } else {
            return new ResponseEntity<Response>(
                    new Response(false, "Category không hợp lệ hoặc không tồn tại", null), 
                    HttpStatus.BAD_REQUEST);
        }

        // Xử lý upload ảnh
        if (imageFile != null && !imageFile.isEmpty()) {
            UUID uuid = UUID.randomUUID();
            String uuString = uuid.toString();
            String filename = storageService.getSorageFilename(imageFile, uuString);
            product.setImages(filename);
            storageService.store(imageFile, filename);
        }

        Product savedProduct = productService.save(product);
        return new ResponseEntity<Response>(
                new Response(true, "Thêm sản phẩm thành công", savedProduct), 
                HttpStatus.OK);
    }

    @PutMapping(path = "/updateProduct", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cập nhật Product (Form-data có cập nhật ảnh)")
    public ResponseEntity<?> updateProduct(
            @Validated @RequestParam("productId") Long productId,
            @Validated @RequestParam("productName") String productName,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @Validated @RequestParam("unitPrice") Double unitPrice,
            @RequestParam(value = "discount", defaultValue = "0") Double discount,
            @RequestParam(value = "description", defaultValue = "") String description,
            @Validated @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "quantity", defaultValue = "0") Integer quantity,
            @RequestParam(value = "status", defaultValue = "1") Short status) {

        Optional<Product> optProduct = productService.findById(productId);
        if (optProduct.isEmpty()) {
            return new ResponseEntity<Response>(
                    new Response(false, "Không tìm thấy sản phẩm", null), 
                    HttpStatus.BAD_REQUEST);
        }

        Product product = optProduct.get();
        product.setProductName(productName);
        product.setUnitPrice(unitPrice);
        product.setDiscount(discount != null ? discount : 0.0);
        product.setDescription(description != null ? description : "");
        product.setQuantity(quantity != null ? quantity : 0);
        product.setStatus(status != null ? status : 1);

        // Gán Category
        Optional<Category> optCategory = categoryService.findById(categoryId);
        if (optCategory.isPresent()) {
            product.setCategory(optCategory.get());
        } else {
            return new ResponseEntity<Response>(
                    new Response(false, "Category không hợp lệ hoặc không tồn tại", null), 
                    HttpStatus.BAD_REQUEST);
        }

        // Cập nhật ảnh nếu có file mới
        if (imageFile != null && !imageFile.isEmpty()) {
            UUID uuid = UUID.randomUUID();
            String uuString = uuid.toString();
            String filename = storageService.getSorageFilename(imageFile, uuString);
            product.setImages(filename);
            storageService.store(imageFile, filename);
        }

        Product updatedProduct = productService.save(product);
        return new ResponseEntity<Response>(
                new Response(true, "Cập nhật sản phẩm thành công", updatedProduct), 
                HttpStatus.OK);
    }

    @DeleteMapping(path = "/deleteProduct")
    @Operation(summary = "Xóa Product theo ID qua RequestParam")
    public ResponseEntity<?> deleteProduct(
            @Validated @RequestParam("productId") Long productId) {

        Optional<Product> optProduct = productService.findById(productId);
        if (optProduct.isEmpty()) {
            return new ResponseEntity<Response>(
                    new Response(false, "Không tìm thấy sản phẩm", null), 
                    HttpStatus.BAD_REQUEST);
        }

        productService.delete(optProduct.get());
        return new ResponseEntity<Response>(
                new Response(true, "Xóa sản phẩm thành công", optProduct.get()), 
                HttpStatus.OK);
    }

    @DeleteMapping(path = "/{id}")
    @Operation(summary = "Xóa Product theo ID qua PathVariable")
    public ResponseEntity<?> deleteProductById(@PathVariable("id") Long id) {
        return deleteProduct(id);
    }
}
