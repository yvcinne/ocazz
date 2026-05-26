<?php

namespace App\Http\Requests;

use App\Models\Annonce;
use Illuminate\Foundation\Http\FormRequest;

class InitiateConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // auth:sanctum middleware gère l'authentification
    }

    public function rules(): array
    {
        return [
            'annonce_id' => [
                'required',
                'integer',
                'exists:annonces,id',
                // Un vendeur ne peut pas ouvrir une conversation sur sa propre annonce
                function ($attribute, $value, $fail) {
                    $annonce = Annonce::find($value);
                    if ($annonce && $annonce->user_id === $this->user()->id) {
                        $fail('You cannot initiate a conversation on your own listing.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'annonce_id.required' => 'The listing is required.',
            'annonce_id.exists'   => 'This listing does not exist.',
        ];
    }
}
