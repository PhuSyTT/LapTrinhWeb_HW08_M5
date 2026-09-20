package vn.iotstar.dto.graphql;

import java.util.List;
import vn.iotstar.entity.Category;

public class CategoryPageResponse {
    private List<Category> content;
    private PageInfo pageInfo;

    public CategoryPageResponse() {
    }

    public CategoryPageResponse(List<Category> content, PageInfo pageInfo) {
        this.content = content;
        this.pageInfo = pageInfo;
    }

    public List<Category> getContent() {
        return content;
    }

    public void setContent(List<Category> content) {
        this.content = content;
    }

    public PageInfo getPageInfo() {
        return pageInfo;
    }

    public void setPageInfo(PageInfo pageInfo) {
        this.pageInfo = pageInfo;
    }
}
