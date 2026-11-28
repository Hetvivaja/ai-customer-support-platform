from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from users.models import User
from users.repositories.user_repository import UserRepository
from django.db.models import Count, Q

@transaction.atomic
def register_customer(username, email, password):
    email=email.strip()

    if UserRepository.get_by_username(username):
        raise ValueError("Username already exists")

    if UserRepository.get_by_email(email):
        raise ValueError("An account with this email already exists")
    
    return UserRepository.create(
        username=username,
        email=email,
        password=password,
        role=User.Role.CUSTOMER
    )
def Get_all_customers():
    return UserRepository.get_all()

def find_customer(user_id):
    return UserRepository.get_by_id(user_id)


def change_customer_email(user_id, new_email):
    user = UserRepository.get_by_id(user_id)

    if user is None:
        return None

    return UserRepository.update(user, email=new_email)

def list_active_agents():
    return (
        User.objects.filter(role=User.Role.AGENT, is_active=True)
        .annotate(
            active_tickets=Count(
                "assigned_tickets",
                filter=Q(assigned_tickets__status__in=["OPEN", "IN_PROGRESS"]),
            )
        )
        .order_by("username")
    )

def _require_admin(actor):
    if actor.role != User.Role.ADMIN:
        raise PermissionError("Only admins can manage users.")


def list_users(actor):
    _require_admin(actor)
    return User.objects.all().order_by("-date_joined")


@transaction.atomic
def create_user_by_admin(actor, username, email, password, role):
    _require_admin(actor)

    username = (username or "").strip()
    email = (email or "").strip()

    if not username or not email or not password:
        raise ValueError("Username, email and password are required.")
    if role not in User.Role.values:
        raise ValueError("Invalid role.")
    if UserRepository.get_by_username(username):
        raise ValueError("Username already exists.")
    if UserRepository.get_by_email(email):
        raise ValueError("An account with this email already exists.")

    try:
        password_validation.validate_password(password)
    except DjangoValidationError as error:
        raise ValueError(" ".join(error.messages))

    return UserRepository.create(
        username=username, email=email, password=password, role=role
    )


def update_user_by_admin(actor, user_id, data):
    _require_admin(actor)

    target = UserRepository.get_by_id(user_id)
    if target is None:
        raise LookupError("User not found.")

    unknown = set(data) - {"role", "is_active"}
    if unknown:
        raise ValueError(f"You cannot change: {', '.join(sorted(unknown))}.")

    changes = {}

    if "role" in data:
        if data["role"] not in User.Role.values:
            raise ValueError("Invalid role.")
        changes["role"] = data["role"]

    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            raise ValueError("is_active must be true or false.")
        changes["is_active"] = data["is_active"]

    if not changes:
        raise ValueError("Nothing to update.")

    if target.id == actor.id and (
        changes.get("role", target.role) != target.role
        or changes.get("is_active", True) is False
    ):
        raise ValueError("You cannot change your own role or deactivate yourself.")

    return UserRepository.update(target, **changes)

def update_profile(user, data):
    allowed = {"first_name", "last_name", "email"}
    unknown = set(data) - allowed
    if unknown:
        raise ValueError(f"You cannot change: {', '.join(sorted(unknown))}.")

    changes = {}

    for field in ("first_name", "last_name"):
        if field in data:
            value = str(data[field] or "").strip()
            if len(value) > 150:
                raise ValueError("Name is too long (maximum 150 characters).")
            changes[field] = value

    if "email" in data:
        email = str(data["email"] or "").strip()
        if not email:
            raise ValueError("Email cannot be empty.")
        other = UserRepository.get_by_email(email)
        if other and other.id != user.id:
            raise ValueError("An account with this email already exists.")
        changes["email"] = email

    if not changes:
        raise ValueError("Nothing to update.")

    return UserRepository.update(user, **changes)


def change_password(user, current_password, new_password):
    if not user.check_password(current_password or ""):
        raise ValueError("Current password is incorrect.")
    if current_password == new_password:
        raise ValueError("The new password must be different.")

    try:
        password_validation.validate_password(new_password or "", user)
    except DjangoValidationError as error:
        raise ValueError(" ".join(error.messages))

    user.set_password(new_password)
    user.save(update_fields=["password"])