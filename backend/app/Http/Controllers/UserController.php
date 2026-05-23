<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserController extends Controller
{
    // Return all users with driver role
    public function drivers()
    {
        $drivers = User::whereIn('role', ['driver', 'local_delivery_man'])
            ->select('id', 'name', 'staff_id', 'phone')
            ->get();

        return response()->json($drivers);
    }
}
