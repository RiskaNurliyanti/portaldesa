<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@desasukamaju.test'],
            [
                'name' => 'Admin Desa',
                'password' => Hash::make('password123'), // GANTI password ini setelah testing
                'role' => 'admin',
            ]
        );
    }
}
