package vn.iotstar.dto.graphql;

import java.util.List;
import vn.iotstar.entity.Product;

public class ProductPageResponse {
    private List<Product> content;
    private PageInfo pageInfo;

    public ProductPageResponse() {
    }

    public ProductPageResponse(List<Product> content, PageInfo pageInfo) {
        this.content = content;
        this.pageInfo = pageInfo;
    }

    public List<Product> getContent() {
        return content;
    }

    public void setContent(List<Product> content) {
        this.content = content;
    }

    public PageInfo getPageInfo() {
        return pageInfo;
    }

    public void setPageInfo(PageInfo pageInfo) {
        this.pageInfo = pageInfo;
    }
}
