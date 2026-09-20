Write-Output "=== TEST 1: Get Categories ==="
curl.exe -s -X GET "http://localhost:8080/api/category"

Write-Output "`n`n=== TEST 2: Add Category ==="
curl.exe -s -X POST "http://localhost:8080/api/category/addCategory" -F "categoryName=Gia Dung Thong Minh"

Write-Output "`n`n=== TEST 3: Get All Categories (Confirm Added) ==="
curl.exe -s -X GET "http://localhost:8080/api/category"

Write-Output "`n`n=== TEST 4: Update Category ID 5 ==="
curl.exe -s -X PUT "http://localhost:8080/api/category/updateCategory" -F "categoryId=5" -F "categoryName=Thiet Bi Gia Dung Cao Cap"

Write-Output "`n`n=== TEST 5: Add Product to Category 5 ==="
curl.exe -s -X POST "http://localhost:8080/api/product/addProduct" -F "productName=Noi Chien Khong Dau Philips" -F "unitPrice=3500000" -F "discount=15" -F "quantity=40" -F "description=Dung tich 5.5L" -F "categoryId=5" -F "status=1"

Write-Output "`n`n=== TEST 6: Get All Products (Confirm Added) ==="
curl.exe -s -X GET "http://localhost:8080/api/product"

Write-Output "`n`n=== TEST 7: Update Product ID 5 ==="
curl.exe -s -X PUT "http://localhost:8080/api/product/updateProduct" -F "productId=5" -F "productName=Noi Chien Khong Dau Philips XXL" -F "unitPrice=3900000" -F "discount=20" -F "quantity=30" -F "description=Dung tich 7.2L Rapid Air" -F "categoryId=5" -F "status=1"

Write-Output "`n`n=== TEST 8: Get Product ID 5 ==="
curl.exe -s -X POST "http://localhost:8080/api/product/getProduct?id=5"

Write-Output "`n`n=== TEST 9: Delete Product ID 5 ==="
curl.exe -s -X DELETE "http://localhost:8080/api/product/deleteProduct?productId=5"

Write-Output "`n`n=== TEST 10: Delete Category ID 5 ==="
curl.exe -s -X DELETE "http://localhost:8080/api/category/deleteCategory?categoryId=5"

Write-Output "`n`n=== Final Verify: Products and Categories ==="
curl.exe -s -X GET "http://localhost:8080/api/category"
curl.exe -s -X GET "http://localhost:8080/api/product"
