package vn.iotstar;

import java.sql.Timestamp;
import java.util.Date;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import vn.iotstar.config.StorageProperties;
import vn.iotstar.entity.Category;
import vn.iotstar.entity.Product;
import vn.iotstar.service.ICategoryService;
import vn.iotstar.service.IProductService;
import vn.iotstar.service.IStorageService;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class SpringBootAjaxApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootAjaxApplication.class, args);
    }

    @Bean
    CommandLineRunner init(IStorageService storageService, 
                          ICategoryService categoryService, 
                          IProductService productService) {
        return (args -> {
            // Khởi tạo thư mục upload
            storageService.init();

            // Khởi tạo dữ liệu mẫu nếu bảng rỗng
            if (categoryService.count() == 0) {
                Category c1 = new Category();
                c1.setCategoryName("Điện Thoại & Phụ Kiện");
                c1.setIcon("default_phone.png");
                categoryService.save(c1);

                Category c2 = new Category();
                c2.setCategoryName("Laptop & Thiết Bị IT");
                c2.setIcon("default_laptop.png");
                categoryService.save(c2);

                Category c3 = new Category();
                c3.setCategoryName("Thời Trang Nam Nữ");
                c3.setIcon("default_fashion.png");
                categoryService.save(c3);

                Category c4 = new Category();
                c4.setCategoryName("Đồng Hồ & Trang Sức");
                c4.setIcon("default_watch.png");
                categoryService.save(c4);

                // Thêm sản phẩm mẫu
                if (productService.count() == 0) {
                    Product p1 = new Product();
                    p1.setProductName("iPhone 15 Pro Max 256GB");
                    p1.setUnitPrice(32990000.0);
                    p1.setDiscount(5.0);
                    p1.setQuantity(50);
                    p1.setDescription("Chip A17 Pro mạnh mẽ, khung viền Titanium sang trọng, camera zoom quang học 5x.");
                    p1.setStatus((short) 1);
                    p1.setImages("default_iphone.png");
                    p1.setCreateDate(new Timestamp(new Date().getTime()));
                    p1.setCategory(c1);
                    productService.save(p1);

                    Product p2 = new Product();
                    p2.setProductName("Samsung Galaxy S24 Ultra");
                    p2.setUnitPrice(29990000.0);
                    p2.setDiscount(8.0);
                    p2.setQuantity(35);
                    p2.setDescription("Tích hợp Galaxy AI thông minh, bút S-Pen tiện ích, màn hình Dynamic AMOLED 2X rực rỡ.");
                    p2.setStatus((short) 1);
                    p2.setImages("default_samsung.png");
                    p2.setCreateDate(new Timestamp(new Date().getTime()));
                    p2.setCategory(c1);
                    productService.save(p2);

                    Product p3 = new Product();
                    p3.setProductName("MacBook Pro 14 M3 Pro");
                    p3.setUnitPrice(49990000.0);
                    p3.setDiscount(3.0);
                    p3.setQuantity(20);
                    p3.setDescription("Hiệu năng đỉnh cao với chip M3 Pro, màn hình Liquid Retina XDR 120Hz mượt mà.");
                    p3.setStatus((short) 1);
                    p3.setImages("default_macbook.png");
                    p3.setCreateDate(new Timestamp(new Date().getTime()));
                    p3.setCategory(c2);
                    productService.save(p3);

                    Product p4 = new Product();
                    p4.setProductName("Áo Sơ Mi Oxford Cao Cấp");
                    p4.setUnitPrice(450000.0);
                    p4.setDiscount(10.0);
                    p4.setQuantity(100);
                    p4.setDescription("Chất liệu 100% cotton thoáng mát, form dáng regular-fit thanh lịch.");
                    p4.setStatus((short) 1);
                    p4.setImages("default_shirt.png");
                    p4.setCreateDate(new Timestamp(new Date().getTime()));
                    p4.setCategory(c3);
                    productService.save(p4);
                }
            }
        });
    }
}
