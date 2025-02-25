<?php

namespace App\Http\Controllers;

use App\Mail\ExampleMail;
use App\Mail\PublicSendMail;
use App\Models\Box;
use App\Models\Document;
use App\Models\DocumentSubmit;
use App\Models\OneTimeLink;
use Illuminate\Http\Request;
use Illuminate\Support\Enumerable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Mime\Email;
use Throwable;

class DocumentController extends Controller
{
    public function sendMail()
    {
        $data = [
            'title' => 'Test Email',
            'body' => 'This is a test email using Gmail in Laravel.',
        ];

        Mail::to('ahsanzafar300@gmail.com')->send(new ExampleMail($data));

        return 'Email sent successfully';
    }


public function getDocument($filename)
    {
        $filePath = 'documents/' . $filename;

        if (Storage::exists($filePath)) {
            $allowedOrigins = ['http://localhost:3000', 'http://localhost:3001','http://localhost:3002','https://docusign.devcir.co','http://docusign.devcir.co','https://userdocusign.devcir.co','http://userdocusign.devcir.co'];

            // Get the 'Origin' header from the request
            $origin = request()->header('Origin');

            // Check if the 'Origin' is in the list of allowed origins
            if (in_array($origin, $allowedOrigins)) {
                $response = response()->stream(function () use ($filePath) {
                    echo Storage::get($filePath);
                }, 200, [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition' => 'inline; filename="' . $filename . '"',
                    'Access-Control-Allow-Origin' => $origin, // Dynamically set the Origin header
                    'Access-Control-Allow-Methods' => 'GET, OPTIONS',
                    'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-API-Key',
                ]);

                return $response;
            }

            // If the origin is not allowed, return a CORS error or handle accordingly
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json(['error' => 'File not found'], 404);
    }
    // public function getDocument($filename)
    // {
    //     $filePath = 'documents/' . $filename;

    //     if (Storage::exists($filePath)) {
    //         $allowedOrigins = ['http://localhost:3000', 'http://localhost:3001','http://localhost:3002','https://docusign.devcir.co','http://docusign.devcir.co','https://userdocusign.devcir.co','http://userdocusign.devcir.co'];

    //         // Get the 'Origin' header from the request
    //         $origin = request()->header('Origin');

    //         // Check if the 'Origin' is in the list of allowed origins
    //         if (in_array($origin, $allowedOrigins)) {
    //             $response = response()->stream(function () use ($filePath) {
    //                 echo Storage::get($filePath);
    //             }, 200, [
    //                 'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    //                 'Content-Disposition' => 'inline; filename="' . $filename . '"',
    //                 'Access-Control-Allow-Origin' => $origin, // Dynamically set the Origin header
    //                 'Access-Control-Allow-Methods' => 'GET, OPTIONS',
    //                 'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-API-Key',
    //             ]);

    //             return $response;
    //         }

    //         // If the origin is not allowed, return a CORS error or handle accordingly
    //         return response()->json(['error' => 'Forbidden'], 403);
    //     }

    //     return response()->json(['error' => 'File not found'], 404);
    // }

    public function deleteDocument($id)
    {
        // Find the document by its ID
        $document = Document::findOrFail($id);

        // Delete the associated file from storage
        if (Storage::exists($document->path)) {
            Storage::delete($document->path);
        }

        // Delete associated input and signature boxes if needed
        Box::where('document_id', $id)->delete();

        // Delete the document from the database
        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }

    public function showDocumentSubmissions($documentId)
    {
        // Fetch document and its related submissions
        $document = Document::with('documentSubmissions')->where('id', $documentId)->get();

        return response()->json($document);
    }

    public function showDocumentSubmissionsuser($documentId)
    {
        $user = Auth::user();

        $submissions = DocumentSubmit::with('document', 'user')->where('document_id', $documentId)->where('user_id', $user->id)->get();

        return response()->json($submissions);
    }

    public function showDocumentSubmissionsuser2(Request $request, $documentId, $user_id)
    {
        $type = $request->query('type') ?? 'template';

        $submissions = $type
            ? DocumentSubmit::with('document', 'user')->where('document_id', $documentId)->where('user_id', $user_id)->where('type', $type)->get() :
            DocumentSubmit::with('document', 'user')->where('document_id', $documentId)->where('user_id', $user_id)->get();

        return response()->json($submissions);
    }

    public function showDocumentSubmissionsuser3(Request $request, $documentId, $email)
    {
        $type = $request->query('type') ?? 'template';


        $submissions = ($type)
            ? DocumentSubmit::with('document')->where('document_id', $documentId)->where('email', $email)->where('type', $type)->get() :
            DocumentSubmit::with('document')->where('document_id', $documentId)->where('email', $email)->get();

        return response()->json($submissions);
    }

    public function showSubmissions(Request $request)
    {
        $type = $request->query('type') ?? 'template';
        // return $type;
        // Fetch all document submissions along with related document and user data
        $submissions = ($type) ?
            DocumentSubmit::with('document', 'user')
                ->where('type', $type)->get() :
            DocumentSubmit::with('document', 'user') // You can also load the related user if needed
                ->get();

        return response()->json([
            'submissions' => $submissions,
        ]);
    }

    public function showSubmissionsuser(Request $request)
    {
        $type = $request->query('type') ?? 'template';
        $user = Auth::user();
        // Fetch all document submissions along with related document and user data
        $submissions1 = DocumentSubmit::with('document', 'user')->where('user_id', $user->id);
        $submissions = $type ? $submissions1->where('type', $type)->get() : $submissions1->get();
        return response()->json([
            'submissions' => $submissions,
        ]);
    }

    /**
     * @throws Throwable
     */
    public function submitToEmail(Request $request, $id)
    {
        $type = $request->query('type') ?? 'template';
        $request->validate([
            'data' => 'required|array', // Ensure data is an array
            'email' => 'required|array',
            // 'type' => 'nullable|in:template,agreement',
            'email.*' => 'email',
        ]);
        
        // Check if the user has already submitted this document
        $existingSubmission = DocumentSubmit::where('document_id', $id)
            ->where('user_id', $request->input('user_id'))
            ->where('status', 'pending')
            ->where('type', $type)
            ->exists();
        // If the submission already exists, return a message and do not create a new one
        if ($existingSubmission) {
            return response()->json([
                'message' => 'user have already this document!',
            ], 409); // 409 Conflict HTTP status code
        }

        // Generate tokens & prepare bulk data
        $tokens = collect($request->email)->map(function ($email) use ($id, $request) {
            return [
                'token' => Str::uuid()->toString(),
                'email' => $email,
                'created_at' => now(),
            ];
        });

        $submitDocuments = collect($request->email)->map(function ($email) use ($id, $request, $type) {
            return [
                'document_id' => $id,
                'email' => $email,
                'data' => json_encode($request->input('data', [])), // ✅ Convert to JSON
                'status' => $request->input('status', 'pending') ?? 'pending',
                'type' => $type,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        });

        // Start Transaction
        DB::beginTransaction();

        try {
            DB::table('one_time_links')->insert($tokens->toArray());
            DB::table('document_submit')->insert($submitDocuments->toArray());

            // Send emails asynchronously
            $tokens->each(function ($tokenData) use ($id, $type) {
                Mail::to($tokenData['email'])->queue(new PublicSendMail([
                    'title' => 'Please submit this form',
                    'body' => 'Admin sent you this document, please open this link and submit your data.',
                    'id' => $id,
                    'type' => $type,
                    'email' => $tokenData['email'],
                    'token' => $tokenData['token']
                ]));
            });

            // Commit only if everything succeeds
            DB::commit();
            return response()->json(['message' => 'Emails sent successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'An error occurred, please try again later.', 'error' => $e->getMessage()], 500);
        }

    }

    public function editDocument(Request $request, $id)
    {
        // Validate input
        $request->validate([
            'document_name' => 'required|string|max:255',
            'input_boxes' => 'required',
            'signature_boxes' => 'required',
            'type' => 'nullable|in:template,agreement'
        ]);

        $user = Auth::user();

        // Find the existing document
        $document = Document::findOrFail($id);

        // Update document data
        $document->update([
            'name' => $request->document_name,
            'input_boxes' => $request->input_boxes,
            'signature_boxes' => $request->signature_boxes,
            'type' => $request->type ?? $document->type,
        ]);

        // Delete existing boxes
        Box::where('document_id', $id)->delete();

        // Save input and signature boxes to DB
        $inputBoxes = json_decode($request->input_boxes, true);
        $signatureBoxes = json_decode($request->signature_boxes, true);

        foreach ($inputBoxes as $box) {
            Box::create([
                'document_id' => $document->id,
                'type' => 'input',
                'field_type' => $box['fieldType'],
                'top' => $box['top'],
                'left' => $box['left'],
                'required' => $box['required'] ?? false,
                'width' => $box['width'] ?? 350,
                'height' => $box['height'] ?? 50,
                'is_expanded' => $box['isExpanded'] ?? false
            ]);
        }

        foreach ($signatureBoxes as $box) {
            Box::create([
                'document_id' => $document->id,
                'type' => 'signature',
                'top' => $box['top'],
                'left' => $box['left'],
                'required' => $box['required'] ?? false,
                'width' => $box['width'] ?? 350,
                'height' => $box['height'] ?? 50,
                'is_expanded' => $box['isExpanded'] ?? false
            ]);
        }

        // Get the full document with relationships
        $documentWithRelations = Document::with(['user', 'boxes'])->find($document->id);

        // Return response
        return response()->json([
            'message' => 'Document updated successfully',
            'document' => $documentWithRelations
        ], 200);
    }

    public function submitDocument(Request $request, $id)
    {
        // Validate the request data
        $request->validate([
            'data' => 'required|array', // Ensure data is an array
            'status' => 'required|string',
            'user_id' => 'required',
            'type' => 'nullable|in:template,agreement'
        ]);

        // Check if the user has already submitted this document
        $existingSubmission = $request->type
            ? DocumentSubmit::where('document_id', $id)
                ->where('user_id', $request->input('user_id'))
                ->where('type', $request->type)
                ->where('status', 'pending')
                ->exists()
            : DocumentSubmit::where('document_id', $id)
                ->where('user_id', $request->input('user_id'))
                ->where('status', 'pending')
                ->exists();

        // If the submission already exists, return a message and do not create a new one
        if ($existingSubmission) {
            return response()->json([
                'message' => 'user have already this document!',
            ], 409); // 409 Conflict HTTP status code
        }

        // Create a new document submission if it doesn't exist
        DocumentSubmit::create([
            'document_id' => $id,
            'user_id' => $request->input('user_id', '1'), // Assuming the user is authenticated
            'data' => $request->input('data', ''), // The form data in JSON format
            'status' => $request->input('status', 'pending'), // Default to pending
            'type' => $request->type ?? 'template',
        ]);

        $data = [
            'title' => 'Please Login and submit this Form',
            'body' => 'Admin send you this document please open this link and submit your data.',
            'link' => $id,
        ];

        Mail::to('ahsanzafar300@gmail.com')->send(new ExampleMail($data));

        return response()->json([
            'message' => 'Document submitted successfully!',
        ]);
    }

    public function submitDocumentUser(Request $request, $id)
    {
        // Validate the request data
        $data = $request->validate([
            'data' => 'required|array', // Ensure data is an array
            'data.*' => 'required|not_in:null,undefined',
            'status' => 'required|string',
        ]);
        $missing = [];
        foreach ($data as $key => $value) {
            if ($value === 'null') {
                $missing[] = $key;
            }
        }

        if (!empty($missing)) {
            return response()->json([
                'message' => 'Missing required fields',
                'missing_fields' => $missing
            ], 422);
        }

        $user = Auth::user();
        // Check if the user has already submitted this document with the 'pending' status
        $existingSubmission = DocumentSubmit::where('document_id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first(); // Retrieve the existing submission

        // If the submission exists, update its status
        if ($existingSubmission) {
            // Update the existing submission's status
            $existingSubmission->update([
                'status' => 'submit', // Update status
                'data' => $request->input('data', ''), // Optionally update the data if necessary
            ]);

            return response()->json([
                'message' => 'Document status updated successfully!',
            ]);
        }

        // If no submission exists with 'pending' status, return a conflict message
        return response()->json([
            'message' => 'User has not submitted this document or the status is not pending.',
        ], 409); // 409 Conflict HTTP status code
    }

    public function submitDocumentUserPublic(Request $request, $id)
    {
        // Validate the request data
        $request->validate([
            'data' => 'required|array', // Ensure data is an array
            'status' => 'required|string',
            'email' => 'required|string',
            'token' => 'required|string',
        ]);


        // Check if the user has already submitted this document with the 'pending' status
        $existingSubmission = DocumentSubmit::where('document_id', $id)
            ->where('email', $request->email)->where('status', 'pending')
            ->first(); // Retrieve the existing submission

        // If the submission exists, update its status
        if ($existingSubmission) {
            // Update the existing submission's status
            $existingSubmission->update([
                'status' => 'submit', // Update status
                'data' => $request->input('data', ''), // Optionally update the data if necessary
            ]);
            OneTimeLink::where('token', $request->token)->update(['used' => true]);
            return response()->json([
                'message' => 'Document status updated successfully!',
            ]);
        }

        // If no submission exists with 'pending' status, return a conflict message
        return response()->json([
            'message' => 'User has not submitted this document or the status is not pending.',
        ], 409); // 409 Conflict HTTP status code
    }

    public function submitDocumentEmail(Request $request, $id)
    {
        // Validate the request data
        $request->validate([
            'data' => 'required|array', // Ensure data is an array
            'status' => 'required|string',
            'token' => 'required|string',
        ]);

        $user = Auth::user();

        // Check if the user has already submitted this document with the 'pending' status
        $existingSubmission = DocumentSubmit::where('document_id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first(); // Retrieve the existing submission

        // If the submission exists, update its status
        if ($existingSubmission) {
            // Update the existing submission's status
            $existingSubmission->update([
                'status' => 'submit', // Update status
                'data' => $request->input('data', ''), // Optionally update the data if necessary
            ]);

            return response()->json([
                'message' => 'Document status updated successfully!',
            ]);
        }

        // If no submission exists with 'pending' status, return a conflict message
        return response()->json([
            'message' => 'User has not submitted this document or the status is not pending.',
        ], 409); // 409 Conflict HTTP status code
    }

    public function index(Request $request)
    {
        $type = $request->query('type') ?? 'template';
        $document = ($type) ? Document::with('boxes')->where('type', $type)->get() : Document::with('boxes')->get();
        return response()->json([
            'document' => $document,
        ]);
    }

    public function user_index(Request $request)
    {
        $type = $request->query('type') ?? 'template';

        $user = Auth::user();
        $document1 = DocumentSubmit::where('user_id', $user->id)->where('status', 'pending')->with('document');
        $document = $type ? $document1->where('type', $type)->get() : $document1->get();

        return response()->json([
            'document' => $document,
        ]);
    }

    public function uploadFile(Request $request)

    
    {
        // Validate input
        $request->validate([
            'document_name' => 'required|string|max:255',
            'file' => 'required|file', // Limit size to 10MB
            'input_boxes' => 'required',
            'signature_boxes' => 'required',
            'type' => 'nullable|in:template,agreement'
        ]);
        $user = Auth::user();

        // Get the original file extension
        $extension = $request->file('file')->getClientOriginalExtension();

        // Generate a unique filename and store the file
        $fileName = time() . '.' . $extension; // You can customize the file name if needed
        $filePath = $request->file('file')->storeAs('documents', $fileName);

        // Save document data to DB
        $document = Document::create([
            'name' => $request->document_name,
            'path' => $filePath,
            'input_boxes' => $request->input_boxes,
            'signature_boxes' => $request->signature_boxes,
            'type' => $request->type ?? 'template',
            'user_id' => $user->id,
        ]);

        $inputBoxes = json_decode($request->input_boxes, true);
        $signatureBoxes = json_decode($request->signature_boxes, true);

        // Save input and signature boxes to DB
        foreach ($inputBoxes as $box) {
            Box::create([
                'document_id' => $document->id,
                'type' => 'input',
                'field_type' => $box['fieldType'],
                'top' => $box['top'],
                'left' => $box['left'],
                'required' => $box['required'] ?? false,
                'width' => $box['width'] ?? 350,
                'height' => $box['height'] ?? 50,
                'is_expanded' => $box['isExpanded'] ?? false
            ]);
        }

        foreach ($signatureBoxes as $box) {
            Box::create([
                'document_id' => $document->id,
                'type' => 'signature',
                'top' => $box['top'],
                'left' => $box['left'],
                'required' => $box['required'] ?? false,
                'width' => $box['width'] ?? 350,
                'height' => $box['height'] ?? 50,
                'is_expanded' => $box['isExpanded'] ?? false
            ]);
        }

        //        return response()->json([
//            'message' => 'File uploaded and boxes saved successfully',
//            'document_id' => $document->id,
//        ], 200);


        // Get the full document with relationships
        $documentWithRelations = Document::with(['user', 'boxes'])->find($document->id);

        return response()->json([
            'message' => 'File uploaded and boxes saved successfully',
            'document' => $documentWithRelations
        ], 200);
    }

    // Save Document with input fields and signature boxes
    public function saveDocument(Request $request)
    {
        // Validate incoming data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'input_boxes' => 'required|array',
            'signature_boxes' => 'nullable|array',
            'file' => 'required|file|mimes:pdf,docx,doc,png,jpg,jpeg|max:10240', // Validate file upload (max size 10MB)
        ]);

        // Handle file upload
        $file = $request->file('file');
        $path = $file->store('documents', 'public'); // Store the file in storage/app/public/documents folder

        $document = new Document;
        $document->name = $validatedData['name'];
        $document->input_boxes = json_encode($validatedData['input_boxes']); // Save input box details as JSON
        $document->signature_boxes = json_encode($validatedData['signature_boxes'] ?? []); // Save signature box details
        $document->status = 'active'; // Default status
        $document->user_id = Auth::id(); // Store the user ID (assuming the user is authenticated)
        $document->path = $path; // Store the file path in the database
        $document->save();

        return response()->json([
            'success' => true,
            'document_id' => $document->id, // Return the document ID for generating the link
        ]);


    }

    // Retrieve Document by ID and display it with the input boxes
    public function showDocument(Request $request, $id)
    {
        $type = $request->query('type') ?? 'template';

        $document = ($type) ?
            Document::with('boxes')
                ->where('id', $id)
                ->where('type', $type)
                ->get()
            :
            Document::with('boxes')
                ->where('id', $id)
                ->get();
        if ($document->isEmpty()) {
            return response()->json(['message' => 'Document not found'], 404);
        }
        return response()->json([
            'document' => $document,
        ]);
    }

    public function showDocumentPending($id)
    {

        $document = Document::with('boxes')->where('id', $id)->where('status', '!=', 'submit')->get();
        if ($document->isEmpty()) {
            return response()->json(['message' => 'Document not found'], 404);
        }
        return response()->json([
            'document' => $document,
        ]);
    }

    public function showDocumentPublic(Request $request, $id, $emailParam, $tokenParam)
    {
        $token = OneTimeLink::where('token', $tokenParam)
            ->where('email', $emailParam)
            ->where('used', false)
            //            ->where('status', 'pending')
            ->first();

        if (!$token) {
            return response()->json(['message' => 'Invalid or Expired link'], 403);
        }
        $document = Document::with('boxes')->where('id', $id)->get();
        return response()->json([
            //         $token->update(['used' => true]);
            'document' => $document,
        ]);
    }

    public function generateOneTimeLink(string $email)
    {
        $token = Str::random(32); // Generate a unique token
        $tokenArr = ['token' => $token, 'email' => $email];
        OneTimeLink::create($tokenArr);
        return response()->json($tokenArr);
    }

    // Submit user data and save it to the document
    public function submitDocument22(Request $request, $id)
    {
        $document = Document::findOrFail($id);

        // Ensure the document belongs to the authenticated user
        if ($document->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Save the user's data (input fields and signature data)
        $document->user_data = json_encode($request->all());
        $document->status = 'inactive'; // Mark the document as inactive after submission
        $document->save();

        return response()->json(['success' => true]);
    }
}
