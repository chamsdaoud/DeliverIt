<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\ParcelStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ParcelController extends Controller
{
    // Public: real-time stats
    public function stats()
    {
        $total     = Parcel::count();
        $delivered = Parcel::whereIn('status', ['delivered', 'confirmed'])->count();
        $rate      = $total > 0 ? round(($delivered / $total) * 100, 1) : 0;
        return response()->json(['wilayas' => 69, 'delivered' => $delivered, 'successRate' => $rate]);
    }

    // Public: track + history
    public function track($code)
    {
        $parcel = Parcel::with('statusHistory')->where('tracking_code', strtoupper($code))->first();
        if (! $parcel) {
            return response()->json(['message' => 'Parcel not found.'], 404);
        }
        return response()->json($parcel);
    }

    // Public: confirm reception
    public function confirmReception(Request $request, $id)
    {
        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $parcel = Parcel::findOrFail($id);

        if ($parcel->status !== 'delivered') {
            return response()->json(['message' => 'Parcel is not in delivered status.'], 422);
        }
        if ($parcel->confirmed_at) {
            return response()->json(['message' => 'Reception already confirmed.'], 422);
        }

        $parcel->update([
            'status'         => 'confirmed',
            'rating'         => $request->rating,
            'rating_comment' => $request->comment,
            'confirmed_at'   => now(),
        ]);

        ParcelStatusHistory::create([
            'parcel_id'       => $parcel->id,
            'status'          => 'confirmed',
            'changed_by_name' => 'Client',
            'note'            => 'Reception confirmed by client. Rating: ' . $request->rating . '/5',
        ]);

        return response()->json($parcel);
    }

    // Agent: list all parcels
    public function index()
    {
        return response()->json(Parcel::latest()->get());
    }

    // Agent: create parcel
    public function store(Request $request)
    {
        $request->validate([
            'sender_name'      => 'required|string',
            'sender_phone'     => 'required|string',
            'pickup_location'  => 'required|string',
            'receiver_name'    => 'required|string',
            'receiver_phone'   => 'required|string',
            'destination'      => 'required|string',
            'delivery_address' => 'nullable|string',
            'description'      => 'nullable|string',
            'weight'           => 'nullable|numeric',
            'payment_method'   => 'required|in:cash,online',
        ]);

        $deliveryType = $request->pickup_location === $request->destination ? 'intra' : 'inter';

        $parcel = Parcel::create([
            'tracking_code'      => 'DZ-' . date('Y') . '-' . strtoupper(Str::random(6)),
            'sender_name'        => $request->sender_name,
            'sender_phone'       => $request->sender_phone,
            'origin_wilaya'      => $request->pickup_location,
            'pickup_location'    => $request->pickup_location,
            'receiver_name'      => $request->receiver_name,
            'receiver_phone'     => $request->receiver_phone,
            'destination_wilaya' => $request->destination,
            'destination'        => $request->destination,
            'delivery_address'   => $request->delivery_address,
            'description'        => $request->description,
            'weight'             => $request->weight,
            'payment_method'     => $request->payment_method,
            'delivery_type'      => $deliveryType,
            'status'             => 'pending',
            'created_by'         => auth()->id(),
        ]);

        // Log initial status
        ParcelStatusHistory::create([
            'parcel_id'       => $parcel->id,
            'status'          => 'pending',
            'changed_by_name' => auth()->user()->name,
            'note'            => 'Parcel registered by agent',
        ]);

        return response()->json($parcel, 201);
    }

    // Update status + log history
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'         => 'required|in:pending,registered,assigned,accepted,refused,out_for_delivery,delivered,failed,confirmed',
            'failure_reason' => 'nullable|string|max:500',
        ]);

        $parcel = Parcel::findOrFail($id);
        $parcel->update([
            'status'         => $request->status,
            'failure_reason' => $request->failure_reason ?? $parcel->failure_reason,
        ]);

        // Build note
        $note = null;
        if ($request->failure_reason) $note = 'Reason: ' . $request->failure_reason;

        ParcelStatusHistory::create([
            'parcel_id'       => $parcel->id,
            'status'          => $request->status,
            'changed_by_name' => auth()->user()->name,
            'note'            => $note,
        ]);

        return response()->json($parcel);
    }

    // Assign + log history
    public function assign(Request $request, $id)
    {
        $request->validate(['delivery_man_id' => 'required|exists:users,id']);
        $parcel = Parcel::findOrFail($id);
        $parcel->update([
            'delivery_man_id' => $request->delivery_man_id,
            'status'          => 'assigned',
        ]);

        $driver = \App\Models\User::find($request->delivery_man_id);
        ParcelStatusHistory::create([
            'parcel_id'       => $parcel->id,
            'status'          => 'assigned',
            'changed_by_name' => auth()->user()->name,
            'note'            => 'Assigned to driver: ' . ($driver->name ?? ''),
        ]);

        return response()->json($parcel);
    }

    // Driver: my parcels
    public function driverParcels()
    {
        $parcels = Parcel::where('delivery_man_id', auth()->id())->latest()->get();
        return response()->json($parcels);
    }
}
