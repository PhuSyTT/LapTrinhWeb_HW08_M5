package vn.iotstar.model;

import java.io.Serializable;
import org.springframework.web.multipart.MultipartFile;

public class CategoryModel implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long categoryId;
    private String categoryName;
    private String icon;
    private MultipartFile iconFile;

    public CategoryModel() {
    }

    public CategoryModel(Long categoryId, String categoryName, String icon, MultipartFile iconFile) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.icon = icon;
        this.iconFile = iconFile;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public MultipartFile getIconFile() {
        return iconFile;
    }

    public void setIconFile(MultipartFile iconFile) {
        this.iconFile = iconFile;
    }
}
