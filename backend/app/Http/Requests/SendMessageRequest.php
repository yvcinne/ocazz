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
            'content' => 'nullable|string|min:1|max:2000',
            'image'   => 'nullable|image|max:5120',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (empty($this->content) && !$this->hasFile('image')) {
                $v->errors()->add('content', 'A message or an image is required.');
            }
        });
    }
}
