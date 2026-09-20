package vn.iotstar.Controller.graphql;

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

import vn.iotstar.dto.graphql.CategoryInput;
import vn.iotstar.dto.graphql.CategoryPageResponse;
import vn.iotstar.dto.graphql.PageInfo;
import vn.iotstar.entity.Category;
import vn.iotstar.entity.Product;
import vn.iotstar.service.ICategoryService;
import vn.iotstar.service.IProductService;

@Controller
public class CategoryGraphQLController {

    @Autowired
    private ICategoryService categoryService;

    @Autowired
    private IProductService productService;

    // Query: allCategories
    @QueryMapping
    public List<Category> allCategories() {
        return categoryService.findAll();
    }

    // Query: categoryById
    @QueryMapping
    public Category categoryById(@Argument Long id) {
        return categoryService.findById(id).orElse(null);
    }

    // Query: categoriesPage
    @QueryMapping
    public CategoryPageResponse categoriesPage(
            @Argument(name = "page") int page,
            @Argument(name = "size") int size,
            @Argument(name = "name") String name) {
        
        int pageIndex = Math.max(0, page);
        int pageSize = size <= 0 ? 10 : size;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "categoryId"));

        Page<Category> categoryPage;
        if (StringUtils.hasText(name)) {
            categoryPage = categoryService.findByCategoryNameContaining(name.trim(), pageable);
        } else {
            categoryPage = categoryService.findAll(pageable);
        }

        PageInfo pageInfo = new PageInfo(categoryPage);
        return new CategoryPageResponse(categoryPage.getContent(), pageInfo);
    }

    // Mutation: createCategory
    @MutationMapping
    public Category createCategory(@Argument CategoryInput input) {
        Category category = new Category();
        category.setCategoryName(input.getCategoryName());
        if (StringUtils.hasText(input.getIcon())) {
            category.setIcon(input.getIcon());
        } else {
            category.setIcon("default_category.png");
        }
        return categoryService.save(category);
    }

    // Mutation: updateCategory
    @MutationMapping
    public Category updateCategory(@Argument Long id, @Argument CategoryInput input) {
        Optional<Category> opt = categoryService.findById(id);
        if (opt.isEmpty()) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        Category category = opt.get();
        if (StringUtils.hasText(input.getCategoryName())) {
            category.setCategoryName(input.getCategoryName());
        }
        if (input.getIcon() != null) {
            category.setIcon(input.getIcon());
        }
        return categoryService.save(category);
    }

    // Mutation: deleteCategory
    @MutationMapping
    public Boolean deleteCategory(@Argument Long id) {
        Optional<Category> opt = categoryService.findById(id);
        if (opt.isPresent()) {
            categoryService.deleteById(id);
            return true;
        }
        return false;
    }

    // SchemaMapping for nested field: Category.products
    @SchemaMapping(typeName = "Category", field = "products")
    public List<Product> products(Category category) {
        return productService.findByCategoryId(category.getCategoryId());
    }
}
