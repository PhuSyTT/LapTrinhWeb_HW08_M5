package vn.iotstar.repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.iotstar.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Tìm kiếm theo nội dung tên
    List<Product> findByProductNameContaining(String name);

    // Tìm kiếm và phân trang
    Page<Product> findByProductNameContaining(String name, Pageable pageable);

    // Tìm theo tên chính xác
    Optional<Product> findByProductName(String name);

    // Tìm theo ngày tạo
    Optional<Product> findByCreateDate(Date createAt);

    // Tìm theo danh mục
    List<Product> findByCategory_CategoryId(Long categoryId);

    // Tìm theo danh mục có phân trang
    Page<Product> findByCategory_CategoryId(Long categoryId, Pageable pageable);

    // Tìm theo tên và danh mục có phân trang
    Page<Product> findByProductNameContainingAndCategory_CategoryId(String name, Long categoryId, Pageable pageable);

    // Tìm tất cả sắp xếp theo đơn giá tăng dần (Price Low to High)
    List<Product> findAllByOrderByUnitPriceAsc();

    // Tìm tất cả sắp xếp theo đơn giá giảm dần (Price High to Low)
    List<Product> findAllByOrderByUnitPriceDesc();

    // Tìm theo danh mục sắp xếp theo giá tăng dần
    List<Product> findByCategory_CategoryIdOrderByUnitPriceAsc(Long categoryId);
}

