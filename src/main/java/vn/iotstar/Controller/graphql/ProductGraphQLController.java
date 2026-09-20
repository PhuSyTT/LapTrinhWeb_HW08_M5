package vn.iotstar.Controller.graphql;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;

import vn.iotstar.dto.graphql.PageInfo;
import vn.iotstar.dto.graphql.ProductInput;
import vn.iotstar.dto.graphql.ProductPageResponse;
import vn.iotstar.entity.Category;
import vn.iotstar.entity.Product;
import vn.iotstar.service.ICategoryService;
import vn.iotstar.service.IProductService;

@Controller
public class ProductGraphQLController {

    @Autowired
    private IProductService productService;

    @Autowired
    private ICategoryService categoryService;

    // Query: allProducts
    @QueryMapping
    public List<Product> allProducts() {
        return productService.findAll();
    }

    // Query: productById
    @QueryMapping
    public Product productById(@Argument Long id) {
        return productService.findById(id).orElse(null);
    }

    // 1. Query: productsSortedByPrice (Mặc định ascending = true: Giá từ thấp đến cao)
    @QueryMapping
    public List<Product> productsSortedByPrice(@Argument(name = "ascending") Boolean ascending) {
        boolean isAsc = ascending == null || ascending;
        return productService.findAllSortedByPrice(isAsc);
    }

    // 2. Query: productsByCategory (Lấy tất cả product của 01 category)
    @QueryMapping
    public List<Product> productsByCategory(@Argument(name = "categoryId") Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            return productService.findAll();
        }
        return productService.findByCategoryId(categoryId);
    }

    // 3. Query: productsPage (Tìm kiếm và phân trang Product)
    @QueryMapping
    public ProductPageResponse productsPage(
            @Argument(name = "page") int page,
            @Argument(name = "size") int size,
            @Argument(name = "name") String name,
            @Argument(name = "categoryId") Long categoryId,
            @Argument(name = "sortBy") String sortBy,
            @Argument(name = "sortDir") String sortDir) {

        int pageIndex = Math.max(0, page);
        int pageSize = size <= 0 ? 10 : size;

        String sortField = StringUtils.hasText(sortBy) ? sortBy : "productId";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(direction, sortField));

        Page<Product> productPage = productService.searchProducts(name, categoryId, pageable);
        PageInfo pageInfo = new PageInfo(productPage);
        return new ProductPageResponse(productPage.getContent(), pageInfo);
    }

    // Mutation: createProduct
    @MutationMapping
    public Product createProduct(@Argument ProductInput input) {
        Product product = new Product();
        product.setProductName(input.getProductName());
        product.setUnitPrice(input.getUnitPrice() != null ? input.getUnitPrice() : 0.0);
        product.setQuantity(input.getQuantity());
        product.setDiscount(input.getDiscount());
        product.setDescription(input.getDescription() != null ? input.getDescription() : "");
        product.setStatus(input.getStatus());
        product.setCreateDate(new Timestamp(new Date().getTime()));

        if (StringUtils.hasText(input.getImages())) {
            product.setImages(input.getImages());
        } else {
            product.setImages("default_product.png");
        }

        if (input.getCategoryId() != null) {
            Optional<Category> optCat = categoryService.findById(input.getCategoryId());
            optCat.ifPresent(product::setCategory);
        }

        return productService.save(product);
    }

    // Mutation: updateProduct
    @MutationMapping
    public Product updateProduct(@Argument Long id, @Argument ProductInput input) {
        Optional<Product> optProd = productService.findById(id);
        if (optProd.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + id);
        }

        Product product = optProd.get();
        if (StringUtils.hasText(input.getProductName())) {
            product.setProductName(input.getProductName());
        }
        if (input.getUnitPrice() != null) {
            product.setUnitPrice(input.getUnitPrice());
        }
        if (input.getQuantity() != null) {
            product.setQuantity(input.getQuantity());
        }
        if (input.getDiscount() != null) {
            product.setDiscount(input.getDiscount());
        }
        if (input.getDescription() != null) {
            product.setDescription(input.getDescription());
        }
        if (input.getStatus() != null) {
            product.setStatus(input.getStatus());
        }
        if (StringUtils.hasText(input.getImages())) {
            product.setImages(input.getImages());
        }

        if (input.getCategoryId() != null) {
            Optional<Category> optCat = categoryService.findById(input.getCategoryId());
            optCat.ifPresent(product::setCategory);
        }

        return productService.save(product);
    }

    // Mutation: deleteProduct
    @MutationMapping
    public Boolean deleteProduct(@Argument Long id) {
        Optional<Product> optProd = productService.findById(id);
        if (optProd.isPresent()) {
            productService.deleteById(id);
            return true;
        }
        return false;
    }

    // SchemaMapping for nested field: Product.category
    @SchemaMapping(typeName = "Product", field = "category")
    public Category category(Product product) {
        if (product.getCategory() != null && product.getCategory().getCategoryId() != null) {
            return categoryService.findById(product.getCategory().getCategoryId()).orElse(null);
        }
        return null;
    }
}
