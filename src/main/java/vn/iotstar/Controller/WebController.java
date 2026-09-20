package vn.iotstar.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import vn.iotstar.service.ICategoryService;
import vn.iotstar.service.IProductService;

@Controller
public class WebController {

    @Autowired
    private ICategoryService categoryService;

    @Autowired
    private IProductService productService;

    @GetMapping(value = {"/", "/home"})
    public String homePage(Model model) {
        model.addAttribute("categoryCount", categoryService.count());
        model.addAttribute("productCount", productService.count());
        model.addAttribute("pageTitle", "Cửa Hàng Trực Tuyến - Spring Boot GraphQL & Thymeleaf");
        return "home";
    }

    @GetMapping("/manage")
    public String managePage(Model model) {
        model.addAttribute("categoryCount", categoryService.count());
        model.addAttribute("productCount", productService.count());
        model.addAttribute("pageTitle", "Quản Lý Hệ Thống - GraphQL AJAX CRUD");
        return "manage";
    }
}
