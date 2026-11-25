<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property string|null $google_id
 * @property string|null $avatar
 * @property string|null $role
 * @property string|null $pos_role
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'google_id', 'avatar', 'phone', 'address', 'province', 'city', 'district', 'postal_code', 'email_verified_at', 'password', 'role', 'pos_role'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'google_id',
        'avatar',
        'phone',
        'address',
        'province',
        'city',
        'district',
        'postal_code',
        'email_verified_at',
        'password',
        'role',
        'pos_role',
    ];

    public function isAdmin(): bool
    {
        return $this->id === 1 || $this->role === 'admin' || $this->pos_role === 'admin';
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner' || $this->pos_role === 'owner';
    }

    public function isKasir(): bool
    {
        return $this->pos_role === 'kasir' || ($this->pos_role === null && $this->role === 'kasir');
    }

    public function isEditor(): bool
    {
        return $this->role === 'editor';
    }

    public function canViewReports(): bool
    {
        return $this->id === 1 || in_array($this->role, ['admin', 'owner'], true) || in_array($this->pos_role, ['admin', 'owner'], true);
    }

    public function canManageStaff(): bool
    {
        return $this->isOwner();
    }

    public function hasPosAccess(): bool
    {
        if ($this->id === 1 || $this->isOwner()) {
            return true;
        }

        if ($this->pos_role !== null && $this->pos_role !== '') {
            return in_array($this->pos_role, ['owner', 'admin', 'kasir'], true);
        }

        return in_array($this->role, ['owner', 'admin', 'kasir'], true);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function canAccessPanel(Panel $panel): bool
    {
        if ($this->id === 1 || $this->isOwner() || $this->isAdmin()) {
            return true;
        }

        return in_array($this->role, ['owner', 'admin', 'editor'], true)
            || in_array($this->pos_role, ['owner', 'admin'], true);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
