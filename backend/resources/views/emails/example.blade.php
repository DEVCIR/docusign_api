<!DOCTYPE html>
<html>
<head>
    <title>Example Mail</title>
</head>
<body>
    <h1>{{ $data['title'] }}</h1>
    <p>{{ $data['body'] }}</p>
    <a href="http://localhost:3001/#/document/view/{{ $data['link'] }}">Click Here</a>
</body>
</html>
