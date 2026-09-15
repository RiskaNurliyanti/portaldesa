<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    // Warga/admin minta link reset password
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        Password::sendResetLink($request->only('email'));

        // Sengaja selalu balas sukses (walau email gak terdaftar sekalipun),
        // supaya orang luar gak bisa "menebak" email mana yang punya akun.
        return response()->json([
            'message' => 'Kalau email terdaftar, link reset password sudah dikirim.',
        ]);
    }

    // Submit password baru pakai token dari link email
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $validated,
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Link reset password tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        return response()->json(['message' => 'Password berhasil diubah.']);
    }
}
