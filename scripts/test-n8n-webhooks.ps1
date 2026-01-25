# Copy/paste this whole file into PowerShell (or run: .\scripts\test-n8n-webhooks.ps1)
#
# What this does:
# 1) Sends test payloads to your local Next.js API routes:
#    - POST /api/forms/contact
#    - POST /api/forms/quote
#    - POST /api/forms/pickup
#    These routes forward to n8n with HMAC (X-Signature).
# 2) Optionally sends a test payload directly to an n8n Webhook URL (useful to confirm n8n is listening).
#
# If n8n is in "Listen for test event" mode, you MUST use the Webhook node's TEST URL.
# The TEST URL and PRODUCTION URL are different in n8n.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-JsonPost {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$JsonBody,
        [hashtable]$Headers = @{}
    )

    Write-Host ""
    Write-Host "==> POST $Url"

    try {
        $resp = Invoke-WebRequest -Method Post -Uri $Url -ContentType "application/json" -Headers $Headers -Body $JsonBody
        Write-Host "Status: $($resp.StatusCode)"
        if ($resp.Content) {
            Write-Host "Body:"
            $resp.Content
        }
    } catch {
        Write-Host "Request failed."
        Write-Host $_.Exception.Message

        $webResp = $_.Exception.Response
        if ($webResp) {
            try {
                $reader = New-Object System.IO.StreamReader($webResp.GetResponseStream())
                $body = $reader.ReadToEnd()
                Write-Host "Upstream status: $($webResp.StatusCode)"
                if ($body) {
                    Write-Host "Upstream body:"
                    $body
                }
            } catch {
                # no-op
            }
        }
    }
}

function Get-HmacSha256Hex {
    param(
        [Parameter(Mandatory = $true)][string]$Secret,
        [Parameter(Mandatory = $true)][string]$Payload
    )

    $keyBytes = [System.Text.Encoding]::UTF8.GetBytes($Secret)
    $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($Payload)
    $hmac = New-Object System.Security.Cryptography.HMACSHA256($keyBytes)
    $hashBytes = $hmac.ComputeHash($payloadBytes)

    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

Write-Host ""
Write-Host "n8n webhook smoke test"
Write-Host "- If you are using n8n 'Listen for test event', you must paste the TEST URL from the Webhook node."
Write-Host "- If you want to test your app -> n8n forwarding, use the LOCAL API tests below."

$AppBaseUrl = Read-Host "Local app base URL (default http://localhost:3000)"
if ([string]::IsNullOrWhiteSpace($AppBaseUrl)) {
    $AppBaseUrl = "http://localhost:3000"
}
$AppBaseUrl = $AppBaseUrl.TrimEnd("/")

Write-Host ""
Write-Host "LOCAL API TESTS (app -> n8n)"

$submissionId = [guid]::NewGuid().ToString()

$contactBody = @{
    submissionId = $submissionId
    name = "Test Contact"
    email = "test@example.com"
    company = "Test Co"
    phone = "(404) 555-1234"
    message = "Hello from PowerShell at $([DateTime]::UtcNow.ToString('o'))"
} | ConvertTo-Json -Depth 10

Invoke-JsonPost -Url "$AppBaseUrl/api/forms/contact" -JsonBody $contactBody

$quoteBody = @{
    submissionId = ([guid]::NewGuid().ToString())
    data = @{
        palletType = "Test Pallet Type"
        quantity = "10"
        frequency = "one-time"
        deliveryLocation = "Atlanta, GA"
        needByDate = ""
        name = "Test Quote"
        email = "test@example.com"
        company = "Test Co"
        phone = "(404) 555-5678"
        notes = "Test quote notes"
    }
} | ConvertTo-Json -Depth 10

Invoke-JsonPost -Url "$AppBaseUrl/api/forms/quote" -JsonBody $quoteBody

$pickupBody = @{
    submissionId = ([guid]::NewGuid().ToString())
    data = @{
        palletCondition = "mixed"
        estimatedQuantity = "25"
        pickupLocation = "Atlanta, GA"
        name = "Test Pickup"
        email = "test@example.com"
        company = "Test Co"
        phone = "(404) 555-9012"
        notes = "Test pickup notes"
    }
    photos = @()
} | ConvertTo-Json -Depth 10

Invoke-JsonPost -Url "$AppBaseUrl/api/forms/pickup" -JsonBody $pickupBody

Write-Host ""
Write-Host "DIRECT n8n TEST (optional)"
Write-Host "Use this if you're unsure whether n8n is receiving anything at all."

$n8nUrl = Read-Host "Paste n8n Webhook TEST URL (or press Enter to skip)"
if (-not [string]::IsNullOrWhiteSpace($n8nUrl)) {
    $n8nSecret = Read-Host "If your workflow verifies X-Signature, paste the secret (or press Enter to send unsigned)"

    $directPayload = @{
        formType = "contact"
        version = 1
        submissionId = ([guid]::NewGuid().ToString())
        submittedAt = [DateTime]::UtcNow.ToString('o')
        fields = @{
            fullName = "Direct n8n Test"
            email = "test@example.com"
            message = "Direct call to n8n from PowerShell"
        }
    } | ConvertTo-Json -Depth 10

    $headers = @{}
    if (-not [string]::IsNullOrWhiteSpace($n8nSecret)) {
        $sig = Get-HmacSha256Hex -Secret $n8nSecret -Payload $directPayload
        $headers["X-Form-Version"] = "1"
        $headers["X-Idempotency-Key"] = ([guid]::NewGuid().ToString())
        $headers["X-Signature"] = $sig
        Write-Host "Computed X-Signature: $sig"
    }

    Invoke-JsonPost -Url $n8nUrl -JsonBody $directPayload -Headers $headers
}

Write-Host ""
Write-Host "Done."

