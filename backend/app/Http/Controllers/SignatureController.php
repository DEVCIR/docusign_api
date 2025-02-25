<?php

namespace App\Http\Controllers;

use App\Models\Signature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
class SignatureController extends Controller
{
    /**
     * Store a newly created signature in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Validate the input data
        $validator = Validator::make($request->all(), [
            'signatureData' => 'required|string', // Signature data (base64 string)
        ]);
        $user = Auth::user();
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Create the signature record
        $signature = Signature::create([
            'user_id' => $user->id,
            'signature_data' => $request->signatureData,
            'sign_id' => rand(10000,10000000000),
        ]);

        return response()->json(['message' => 'Signature saved successfully', 'signature' => $signature], 201);
    }

    /**
     * Display the specified signature.
     *
     * @param  \App\Models\Signature  $signature
     * @return \Illuminate\Http\Response
     */
    public function show(Signature $signature)
    {
        return response()->json(['signature' => $signature]);
    }

    /**
     * Update the specified signature in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Signature  $signature
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Signature $signature)
    {
        // Validate the input data
        $validator = Validator::make($request->all(), [
            'signature_data' => 'required|string', // Signature data (base64 string)
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Update the signature record
        $signature->update([
            'signature_data' => $request->signature_data,
        ]);

        return response()->json(['message' => 'Signature updated successfully', 'signature' => $signature]);
    }

    /**
     * Remove the specified signature from storage.
     *
     * @param  \App\Models\Signature  $signature
     * @return \Illuminate\Http\Response
     */
    public function destroy(Signature $signature)
    {
        $signature->delete();

        return response()->json(['message' => 'Signature deleted successfully']);
    }

    /**
     * List all signatures for a specific user.
     *
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function index()
    {   
        $user = Auth::user();
        // Get all signatures for a specific user
        $signatures = Signature::where('user_id', $user->id)->get();

        return response()->json(['signatures' => $signatures]);
    }
}
