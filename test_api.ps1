Write-Output "=== TEST 1: Get Categories ==="
$cats = Invoke-RestMethod -Uri "http://localhost:8080/api/category" -Method GET
$cats | ConvertTo-Json -Depth 4

Write-Output "`n=== TEST 2: Add Category ==="
$form = @{ categoryName = "Gia Dung Thong Minh" }
$addCat = Invoke-RestMethod -Uri "http://localhost:8080/api/category/addCategory" -Method POST -Form $form
$addCat | ConvertTo-Json -Depth 4
$newCatId = $addCat.body.categoryId
Write-Output "New Category ID: $newCatId"

Write-Output "`n=== TEST 3: Update Category ==="
$updateForm = @{ categoryId = "$newCatId"; categoryName = "Thiet Bi Gia Dung Cao Cap" }
$updateCat = Invoke-RestMethod -Uri "http://localhost:8080/api/category/updateCategory" -Method PUT -Form $updateForm
$updateCat | ConvertTo-Json -Depth 4

Write-Output "`n=== TEST 4: Add Product ==="
$prodForm = @{
    productName = "Noi Chien Khong Dau Philips"
    unitPrice = "3500000"
    discount = "15"
    quantity = "40"
    description = "Dung tich 5.5L"
    categoryId = "$newCatId"
    status = "1"
}
$addProd = Invoke-RestMethod -Uri "http://localhost:8080/api/product/addProduct" -Method POST -Form $prodForm
$addProd | ConvertTo-Json -Depth 4
$newProdId = $addProd.body.productId
Write-Output "New Product ID: $newProdId"

Write-Output "`n=== TEST 5: Update Product ==="
$updateProdForm = @{
    productId = "$newProdId"
    productName = "Noi Chien Khong Dau Philips XXL"
    unitPrice = "3900000"
    discount = "20"
    quantity = "30"
    description = "Dung tich 7.2L"
    categoryId = "$newCatId"
    status = "1"
}
$updateProd = Invoke-RestMethod -Uri "http://localhost:8080/api/product/updateProduct" -Method PUT -Form $updateProdForm
$updateProd | ConvertTo-Json -Depth 4

Write-Output "`n=== TEST 6: Get Product by ID ==="
$getProd = Invoke-RestMethod -Uri "http://localhost:8080/api/product/getProduct" -Method POST -Body @{ id = $newProdId }
$getProd | ConvertTo-Json -Depth 4

Write-Output "`n=== TEST 7: Delete Product ==="
$delProd = Invoke-RestMethod -Uri ("http://localhost:8080/api/product/deleteProduct?productId=" + $newProdId) -Method DELETE
$delProd | ConvertTo-Json -Depth 4

Write-Output "`n=== TEST 8: Delete Category ==="
$delCat = Invoke-RestMethod -Uri ("http://localhost:8080/api/category/deleteCategory?categoryId=" + $newCatId) -Method DELETE
$delCat | ConvertTo-Json -Depth 4
