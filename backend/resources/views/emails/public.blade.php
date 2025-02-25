<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $data['title'] }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        h1 {
            color: #333;
            font-size: 24px;
        }

        p {
            font-size: 16px;
            color: #555;
            line-height: 1.5;
        }

        .btn {
            display: inline-block;
            padding: 12px 20px;
            margin-top: 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }

        .btn:hover {
            background-color: #0056b3;
        }

        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>{{ $data['title'] }}</h1>
    <p>{{ $data['body'] }}</p>

    @php
        $frontendUrl = env('USER_FRONTEND_URL')  ?? 'https://userdocusign.devcir.co'; // Default to user frontend
        $id = $data['id'];
        $token = $data['token'];
        $email = $data['email'];
    @endphp

    <a href="{{ "$frontendUrl/public/document/viewPublic/$id?token=$token&email=$email" }}" class="btn">
        Submit Your Data
    </a>

    <p class="footer">If you didn’t request this, please ignore this email.</p>
</div>
</body>
</html>
