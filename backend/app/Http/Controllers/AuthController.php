<?php

namespace App\Http\Controllers;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // User registration
    public function register(Request $request)
    {
        try {
            // Validate request data
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
                // 'role' => 'in:user,admin',
                // 'profile' => 'required|file|mimes:jpg,jpeg,png',
                // 'profile' => 'required|string',
                // 'desc' => 'required|string',
            ]);

            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'user', // Default to 'user' role
                // 'profile' => $profilePath,
                'profile' => $request->profile ?? 'null',
                'desc' => $request->desc ?? '',
            ]);

            // Generate a token for the user
            $token = $user->createToken('authToken')->plainTextToken;

            // Return response
            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Check if the email is already taken
            if ($e->validator->errors()->has('email')) {
                return response()->json([
                    'message' => 'The email has already been taken.',
                    'errors' => $e->validator->errors()
                ], 422);
            }

            // Return other validation errors
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->validator->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Return a JSON response if the type is not found
            return response()->json(["error" => $e->getMessage(), 'message' => 'amenity name Not Found'], 422);
        } catch (\Exception $e) {
            // Log the exception for debugging
            \Log::error('Registration error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Something went wrong, please try again',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login an existing user
     */
    public function admin_login(Request $request)
    {
        // Validate request data
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Attempt to login the user
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Generate a token for the user
        $user = Auth::user();

        if ($user->role !== 'admin') {
            throw ValidationException::withMessages([
                'email' => ['You do not have permission to access this resource.'],
            ]);
        }

        $token = $user->createToken('authToken')->plainTextToken;

        // Return response
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
    public function user_login(Request $request)
    {
        // Validate request data
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Attempt to login the user
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Generate a token for the user
        $user = Auth::user();

        if ($user->role !== 'user') {
            throw ValidationException::withMessages([
                'email' => ['You do not have permission to access this resource.'],
            ]);
        }

        $token = $user->createToken('authToken')->plainTextToken;

        // Return response
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * Logout the authenticated user
     */
    public function logout(Request $request)
    {
        // Revoke all tokens for the user
        $request->user()->tokens()->delete();

        // Return response
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user()
    {
        $users = User::where('role', 'user')->get();
        return response()->json($users);
    }



}