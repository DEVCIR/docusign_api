<!DOCTYPE html>
<html>
<head>
    <title>Screenshots</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        img {
            width: 100%;
            height: auto;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    @if(is_array($screenshots) && count($screenshots) > 0)
        @foreach($screenshots as $screenshot)
            <div style="page-break-after: always;">
                <img src="{{ $screenshot }}" />
            </div>
        @endforeach
    @else
        <p>No screenshots available.</p>
    @endif
</body>
</html>