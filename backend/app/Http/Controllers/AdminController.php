<?php

namespace App\Http\Controllers;

use App\Models\User;

class AdminController extends Controller
{
    public function users()
    {
        return response()->json(User::latest()->get());
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account.'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }
}
