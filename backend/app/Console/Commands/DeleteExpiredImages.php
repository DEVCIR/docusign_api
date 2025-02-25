<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class DeleteExpiredImages extends Command
{
    protected $signature = 'images:delete-expired';
    protected $description = 'Delete images that are older than the set expiration time.';

    public function handle()
    {
        $expiredImages = DB::table('images')->where('delete_at', '<=', now())->get();
        foreach ($expiredImages as $image) {
            // Delete the image file
            if (Storage::disk('public')->exists($image->path)) {
                Storage::disk('public')->delete($image->path);
            }

            // Delete the record from the database
            DB::table('images')->where('id', $image->id)->delete();
        }

        $this->info('Expired images deleted successfully.');
    }
}