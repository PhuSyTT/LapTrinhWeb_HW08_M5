package vn.iotstar.dto.graphql;

public class CategoryInput {
    private String categoryName;
    private String icon;

    public CategoryInput() {
    }

    public CategoryInput(String categoryName, String icon) {
        this.categoryName = categoryName;
        this.icon = icon;
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
}
