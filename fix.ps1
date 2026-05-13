$filePath = "c:\Users\PORSCHE\OneDrive\Documents\GitHub\-SIKAPTala-gg-ano-tara--Echo\app\dashboard\page.tsx"
$content = Get-Content $filePath -Raw

# Fix the literal \r\n issue
$content = $content -replace '>\\\r\\\n                        Create', '>' + "`n" + '                        Create'

Set-Content $filePath -Value $content
