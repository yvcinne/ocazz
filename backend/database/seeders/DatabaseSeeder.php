<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        \App\Models\User::updateOrCreate(
            ['email' => 'admin@ocazz.ma'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('Admin@1234'),
                'role'     => 'admin',
            ]
        );
    }
}
