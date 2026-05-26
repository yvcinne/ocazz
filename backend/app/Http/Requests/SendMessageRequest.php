<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // La Policy ConversationPolicy::participate gère l'autorisation
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string|min:1|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Message content cannot be empty.',
            'content.max'      => 'Message cannot exceed 2000 characters.',
        ];
    }
}
