<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
class UserController extends Controller
{
    // Display all users
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }
    
    public function total_user()
        {
            $totalUsers = User::count();
            return response()->json(['total_users' => $totalUsers]);
        }


    // Store a new user
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
        ]);
        return response()->json($user, 201);
    }

    // Display a single user by ID
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    // Update a user by ID
    // public function update(Request $request, $id)
    // {
    //     $user = User::findOrFail($id);

    //     $validatedData = $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
    //         'password' => 'nullable|string|min:6',
    //     ]);

    //     $user->update([
    //         'name' => $validatedData['name'],
    //         'email' => $validatedData['email'],
    //         'password' => $validatedData['password'] ? bcrypt($validatedData['password']) : $user->password,
    //     ]);

    //     return response()->json($user);
    // }


    public function update(Request $request, $id)
    {
        // Validate incoming data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8', // password is optional
        ]);

        try {
            // Find the user by id
            $user = User::findOrFail($id);

            // Update the user's name and email
            $user->name = $request->input('name');
            $user->email = $request->input('email');

            // If a password is provided, hash it and update it
            if ($request->filled('password')) {
                $user->password = Hash::make($request->input('password'));
            }

            // Save the updated user
            $user->save();

            // Return success response
            return response()->json(['message' => 'User updated successfully.'], 200);
        } catch (\Exception $e) {
            // If there's any issue, return a failure response
            return response()->json(['error' => 'Failed to update user.'], 500);
        }
    }

    // Delete a user by ID
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function contact($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function sendContactForm(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
        ]);

        // Prepare the email headers and message
        $to = 'design@agencepersee.com'; // Replace with the recipient's email
        $subject = $validatedData['subject'];
        $message = 'Name: ' . $validatedData['name'] . "\n" .
                   'Email: ' . $validatedData['email'] . "\n\n" .
                   'Message: ' . $validatedData['message'];
        $headers = "From: " . $validatedData['email'] . "\r\n" .
                   "Reply-To: " . $validatedData['email'] . "\r\n" .
                   "X-Mailer: PHP/" . phpversion();

        // Send the email using PHP's mail() function
        if (mail($to, $subject, $message, $headers)) {
            // If email sent successfully, return a success response
            return response()->json(['message' => 'Form submitted successfully!'], 200);
        } else {
            // If email failed to send, return an error response
            return response()->json(['message' => 'Form submission failed, please try again later.'], 500);
        }
    }


}
