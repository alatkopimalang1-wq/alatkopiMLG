<?php

namespace App\Policies;

use App\Models\PosCashFlow;
use App\Models\User;

class PosCashFlowPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PosCashFlow $flow): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, PosCashFlow $flow): bool
    {
        return $user->isOwner();
    }

    public function delete(User $user, PosCashFlow $flow): bool
    {
        return $user->isOwner();
    }

    public function deleteAny(User $user): bool
    {
        return $user->isOwner();
    }

    public function forceDelete(User $user, PosCashFlow $flow): bool
    {
        return $user->isOwner();
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->isOwner();
    }
}
