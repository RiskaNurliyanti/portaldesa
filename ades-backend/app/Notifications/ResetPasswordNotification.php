<?php

namespace App\Notifications;

use App\Support\FrontendUrl;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public function __construct(public string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = FrontendUrl::resolve();
        $email = urlencode($notifiable->getEmailForPasswordReset());
        $url = "{$frontendUrl}/reset-password?token={$this->token}&email={$email}";

        return (new MailMessage)
            ->subject('Reset Password Akun Desa Sukamaju')
            ->greeting('Halo, ' . $notifiable->name)
            ->line('Kami menerima permintaan untuk mereset password akun kamu.')
            ->action('Reset Password', $url)
            ->line('Link ini berlaku 60 menit. Kalau kamu tidak meminta ini, abaikan saja email ini.');
    }
}
