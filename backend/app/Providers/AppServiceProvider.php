<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Swift_SmtpTransport;
use Swift_Mailer;
use Swift_KeyCache_ArrayKeyCache;
use Swift_KeyCache_SimpleKeyCacheInputStream;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Custom SwiftMailer setup
        $this->app->singleton('swift.mailer', function ($app) {
            $transport = new Swift_SmtpTransport(
                config('mail.host'),
                config('mail.port')
            );

            $transport->setUsername(config('mail.username'));
            $transport->setPassword(config('mail.password'));
            $transport->setEncryption(config('mail.encryption'));

            $cache = new Swift_KeyCache_ArrayKeyCache(new Swift_KeyCache_SimpleKeyCacheInputStream());

            $mailer = new Swift_Mailer($transport);
            $mailer->registerPlugin(new \Swift_Plugins_AntiFloodPlugin(100, 30));
            $mailer->setKeyCache($cache);

            return $mailer;
        });
    }
}
