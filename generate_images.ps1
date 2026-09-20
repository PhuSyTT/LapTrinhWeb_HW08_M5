Add-Type -AssemblyName System.Drawing

$items = @(
    @{Name='default_category.png'; R=67; G=97; B=238; Text='CAT'},
    @{Name='default_product.png'; R=76; G=201; B=240; Text='PROD'},
    @{Name='default_phone.png'; R=59; G=130; B=246; Text='Phone'},
    @{Name='default_laptop.png'; R=139; G=92; B=246; Text='Laptop'},
    @{Name='default_fashion.png'; R=236; G=72; B=153; Text='Fashion'},
    @{Name='default_watch.png'; R=245; G=158; B=11; Text='Watch'},
    @{Name='default_iphone.png'; R=30; G=41; B=59; Text='iPhone 15'},
    @{Name='default_samsung.png'; R=16; G=185; B=129; Text='Galaxy S24'},
    @{Name='default_macbook.png'; R=100; G=116; B=139; Text='MacBook'},
    @{Name='default_shirt.png'; R=249; G=115; B=22; Text='Shirt'}
)

if (!(Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads"
}

foreach ($item in $items) {
    $bmp = New-Object System.Drawing.Bitmap 200, 200
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $color = [System.Drawing.Color]::FromArgb($item.R, $item.G, $item.B)
    $brushBg = New-Object System.Drawing.SolidBrush $color
    $g.FillRectangle($brushBg, 0, 0, 200, 200)

    $font = New-Object System.Drawing.Font ('Arial', [float]18, [System.Drawing.FontStyle]::Bold)
    $brushText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF 0, 0, 200, 200
    $g.DrawString($item.Text, $font, $brushText, $rect, $sf)

    $dest = Join-Path "uploads" $item.Name
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $font.Dispose()
    $brushText.Dispose()
    $brushBg.Dispose()
    $g.Dispose()
    $bmp.Dispose()
}
Write-Output "Sample images generated successfully."
