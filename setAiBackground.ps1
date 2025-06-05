# Load environment variables from .env file
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]*)\s*=\s*(.*)\s*$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value -replace '^"(.*)"$', '$1'
            $value = $value -replace "^'(.*)'$", '$1'
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Error ".env file not found at: $envFile"
    Exit 1
}

# Generate unique filename with timestamp and random string
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$randomString = -join ((65..90) + (97..122) | Get-Random -Count 6 | ForEach-Object {[char]$_})
$filename = "$timestamp" + "_$randomString.png"

# Run npm run image to generate the image
Write-Host "Generating AI image..."
npm run image $filename

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to generate image. npm run image exited with code $LASTEXITCODE"
    Exit 1
}

Write-Host "Image generation completed. Setting as wallpaper..."

# Set as wallpaper
$code = @"
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
Add-Type -TypeDefinition $code -Language CSharp

$imagePath = "$env:IMAGE_PATH\$filename"

# Verify the image file exists
if (-not (Test-Path $imagePath)) {
    Write-Error "Image file not found at: $imagePath"
    Exit 1
}

Write-Host "Setting wallpaper to: $imagePath"

# Set wallpaper using the correct parameters
$result = [Wallpaper]::SystemParametersInfo(20, 0, $imagePath, 0x01 -bor 0x02)

if ($result) {
    Write-Host "Wallpaper set successfully!"
} else {
    Write-Error "Failed to set wallpaper. SystemParametersInfo returned: $result"
}

# Exit script
Exit