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