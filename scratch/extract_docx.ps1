Add-Type -AssemblyName System.IO.Compression.FileSystem
$path = "c:\Users\victus\Desktop\ogun\scratch\Service TEAM (4).docx"
try {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    $entry = $zip.Entries | Where-Object { $_.FullName -eq "word/document.xml" }
    if ($entry) {
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xml = [xml]$reader.ReadToEnd()
        $reader.Close()
        $zip.Dispose()
        
        # Extract text from w:t tags
        $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
        $nodes = $xml.SelectNodes("//w:t", $ns)
        foreach ($node in $nodes) {
            Write-Host $node.InnerText -NoNewline
            Write-Host " " -NoNewline
        }
        Write-Host ""
    } else {
        Write-Error "Could not find word/document.xml in the docx file."
    }
} catch {
    Write-Error $_.Exception.Message
}
