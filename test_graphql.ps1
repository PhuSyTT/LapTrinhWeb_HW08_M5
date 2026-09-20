# PowerShell Script for testing Spring Boot GraphQL API
$graphqlUrl = "http://localhost:8080/graphql"

function Invoke-GraphQL {
    param (
        [string]$Query,
        [hashtable]$Variables = @{}
    )
    $payload = @{
        query = $Query
        variables = $Variables
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri $graphqlUrl -Method POST -Body $payload -ContentType "application/json; charset=utf-8"
        return $response
    } catch {
        Write-Error $_.Exception.Message
        return $null
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SPRING BOOT GRAPHQL API AUTOMATED TEST SUITE          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# TEST 1: Query All Categories
Write-Host "`n[TEST 1] Query: allCategories" -ForegroundColor Yellow
$q1 = "query { allCategories { categoryId categoryName icon } }"
$res1 = Invoke-GraphQL -Query $q1
$res1.data.allCategories | Format-Table categoryId, categoryName, icon

# TEST 2: Query Products Sorted By Price Ascending (Thấp đến Cao)
Write-Host "`n[TEST 2] Query: productsSortedByPrice(ascending: true)" -ForegroundColor Yellow
$q2 = "query { productsSortedByPrice(ascending: true) { productId productName unitPrice discount quantity category { categoryName } } }"
$res2 = Invoke-GraphQL -Query $q2
$res2.data.productsSortedByPrice | Format-Table productId, productName, unitPrice, discount, quantity

# TEST 3: Query Products by 1 Category
Write-Host "`n[TEST 3] Query: productsByCategory(categoryId: 1)" -ForegroundColor Yellow
$q3 = "query { productsByCategory(categoryId: 1) { productId productName unitPrice category { categoryName } } }"
$res3 = Invoke-GraphQL -Query $q3
$res3.data.productsByCategory | Format-Table productId, productName, unitPrice

# TEST 4: Query Products with Pagination & Search
Write-Host "`n[TEST 4] Query: productsPage(page: 0, size: 5, name: `"iPhone`")" -ForegroundColor Yellow
$q4 = "query { productsPage(page: 0, size: 5, name: `"iPhone`") { content { productId productName unitPrice } pageInfo { totalElements totalPages pageNumber pageSize } } }"
$res4 = Invoke-GraphQL -Query $q4
Write-Host "Total Elements: $($res4.data.productsPage.pageInfo.totalElements)" -ForegroundColor Green
$res4.data.productsPage.content | Format-Table productId, productName, unitPrice

# TEST 5: Mutation: Create Category
Write-Host "`n[TEST 5] Mutation: createCategory" -ForegroundColor Yellow
$m1 = 'mutation { createCategory(input: { categoryName: "Thiết Bị Nhà Thông Minh SmartHome", icon: "default_smart.png" }) { categoryId categoryName } }'
$res5 = Invoke-GraphQL -Query $m1
$newCatId = $res5.data.createCategory.categoryId
Write-Host "Created Category ID: $newCatId ($($res5.data.createCategory.categoryName))" -ForegroundColor Green

# TEST 6: Mutation: Create Product
Write-Host "`n[TEST 6] Mutation: createProduct" -ForegroundColor Yellow
$m2 = "mutation { createProduct(input: { productName: `"Robot Hut Bui Xiaomi X20`", unitPrice: 8990000.0, quantity: 25, discount: 10.0, categoryId: $newCatId, description: `"Luc hut 5000Pa, lau nha tu dong`" }) { productId productName unitPrice quantity } }"
$res6 = Invoke-GraphQL -Query $m2
$newProdId = $res6.data.createProduct.productId
Write-Host "Created Product ID: $newProdId ($($res6.data.createProduct.productName))" -ForegroundColor Green

# TEST 7: Mutation: Update Product
Write-Host "`n[TEST 7] Mutation: updateProduct" -ForegroundColor Yellow
$m3 = "mutation { updateProduct(id: $newProdId, input: { productName: `"Robot Hut Bui Xiaomi X20 Pro Max`", unitPrice: 9990000.0, quantity: 30, discount: 15.0, categoryId: $newCatId }) { productId productName unitPrice discount } }"
$res7 = Invoke-GraphQL -Query $m3
Write-Host "Updated Product: $($res7.data.updateProduct.productName) - New Price: $($res7.data.updateProduct.unitPrice)" -ForegroundColor Green

# TEST 8: Mutation: Delete Product
Write-Host "`n[TEST 8] Mutation: deleteProduct" -ForegroundColor Yellow
$m4 = "mutation { deleteProduct(id: $newProdId) }"
$res8 = Invoke-GraphQL -Query $m4
Write-Host "Delete Product Result: $($res8.data.deleteProduct)" -ForegroundColor Green

# TEST 9: Mutation: Delete Category
Write-Host "`n[TEST 9] Mutation: deleteCategory" -ForegroundColor Yellow
$m5 = "mutation { deleteCategory(id: $newCatId) }"
$res9 = Invoke-GraphQL -Query $m5
Write-Host "Delete Category Result: $($res9.data.deleteCategory)" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "          ALL GRAPHQL TESTS COMPLETED!                    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
