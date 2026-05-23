<?php

namespace App\Http\Controllers;

use App\Mail\StaffCredentialsMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate(['password' => 'required']);

        if ($request->has('staffId')) {
            $user = User::where('staff_id', $request->staffId)->first();
        } else {
            $request->validate(['email' => 'required|email']);
            $user = User::where('email', $request->email)->first();
        }

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'credentials' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'role'  => $user->role,
            'name'  => $user->name,
        ]);
    }

    public function register(Request $request)
    {
        $isStaff = $request->has('staffId');

        if ($isStaff) {
            $request->validate([
                'name'     => 'required|string|max:255',
                'staffId'  => 'required|string|unique:users,staff_id',
                'phone'    => 'required|string',
                'email'    => 'required|email|unique:users',
                'password' => 'required|min:8',
                'role'     => 'required|in:admin,agency,driver',
            ]);

            $user = User::create([
                'name'     => $request->name,
                'staff_id' => $request->staffId,
                'phone'    => $request->phone,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => $request->role,
            ]);

            // Send credentials email
            try {
                Mail::to($request->email)->send(new StaffCredentialsMail(
                    staffName: $request->name,
                    staffId:   $request->staffId,
                    role:      $request->role,
                    email:     $request->email,
                    password:  $request->password, // plain text before hashing
                ));
            } catch (\Exception $e) {
                // Don't fail registration if email fails
                \Log::warning('Failed to send staff credentials email: ' . $e->getMessage());
            }

        } else {
            // Client registration
            $request->validate([
                'name'     => 'required|string|max:255',
                'phone'    => 'required|string',
                'email'    => 'required|email|unique:users',
                'password' => 'required|min:8',
            ]);

            $user = User::create([
                'name'     => $request->name,
                'phone'    => $request->phone,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'client',
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'role'  => $user->role,
            'name'  => $user->name,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }
}
